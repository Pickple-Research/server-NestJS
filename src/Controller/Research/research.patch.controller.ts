import {
  Controller,
  Inject,
  Request,
  Body,
  Patch,
  Param,
} from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { UserUpdateService, ResearchUpdateService } from "src/Service";
import {
  MongoUserFindService,
  MongoUserCreateService,
  MongoUserUpdateService,
  MongoResearchFindService,
  MongoResearchUpdateService,
} from "src/Mongo";
import {
  Research,
  ResearchScrap,
  ResearchParticipation,
  CreditHistory,
} from "src/Schema";
import { Public } from "src/Security/Metadata";
import { JwtUserInfo } from "src/Object/Type";
import { CreditHistoryType } from "src/Object/Enum";
import {
  ResearchParticiateBodyDto,
  ResearchPullupBodyDto,
  ResearchUpdateBodyDto,
} from "src/Dto";
import { getCurrentISOTime, tryMultiTransaction } from "src/Util";
import {
  MONGODB_USER_CONNECTION,
  MONGODB_RESEARCH_CONNECTION,
  RESEARCH_PULLUP_CREDIT,
} from "src/Constant";
import { NotEnoughCreditException } from "src/Exception";

/**
 * 리서치 데이터에 대한 Patch 메소드 요청을 관리합니다.
 * @author 현웅
 */
@Controller("researches")
export class ResearchPatchController {
  constructor(
    private readonly userUpdateService: UserUpdateService,
    private readonly researchUpdateService: ResearchUpdateService,

    @InjectConnection(MONGODB_USER_CONNECTION)
    private readonly userConnection: Connection,
    @InjectConnection(MONGODB_RESEARCH_CONNECTION)
    private readonly researchConnection: Connection,
  ) {}

  @Inject() private readonly mongoUserFindService: MongoUserFindService;
  @Inject() private readonly mongoUserCreateService: MongoUserCreateService;
  @Inject() private readonly mongoUserUpdateService: MongoUserUpdateService;
  @Inject()
  private readonly mongoResearchFindService: MongoResearchFindService;
  @Inject()
  private readonly mongoResearchUpdateService: MongoResearchUpdateService;

  /**
   * 리서치를 조회합니다.
   * @author 현웅
   */
  @Public()
  @Patch("view/:researchId")
  async viewResearch(@Param() param: { researchId: string }) {
    return await this.mongoResearchUpdateService.updateView({
      researchId: param.researchId,
    });
  }

  /**
   * 리서치를 스크랩합니다.
   * @return 업데이트된 리서치 정보, 생성된 리서치 스크랩 정보
   * @author 현웅
   */
  @Patch("scrap/:researchId")
  async scrapResearch(
    @Request() req: { user: JwtUserInfo },
    @Param("researchId") researchId: string,
  ) {
    const researchScrap: ResearchScrap = {
      userId: req.user.userId,
      researchId,
      createdAt: getCurrentISOTime(),
    };

    const { updatedResearch, newResearchScrap } =
      await this.researchUpdateService.scrapResearch({
        researchId,
        researchScrap,
      });
    return { updatedResearch, newResearchScrap };
  }

  /**
   * 리서치 스크랩을 취소합니다.
   * @return 업데이트된 리서치 정보
   * @author 현웅
   */
  @Patch("unscrap/:researchId")
  async unscrapResearch(
    @Request() req: { user: JwtUserInfo },
    @Param() param: { researchId: string },
  ) {
    const updatedResearch = await this.researchUpdateService.unscrapResearch({
      userId: req.user.userId,
      researchId: param.researchId,
    });
    return updatedResearch;
  }

  /**
   * @Transaction
   * 리서치에 참여합니다.
   * 조회, 스크랩과 다르게 데이터 정합성이 필요하므로 Transaction을 활용해야합니다.
   * @return (업데이트 된 리서치 정보, 생성된 리서치 참여 정보, 생성된 크레딧 변동내역 ) | 크레딧 변동내역
   * @author 현웅
   */
  @Patch("participate/:researchId")
  async participateResearch(
    @Request() req: { user: JwtUserInfo },
    @Param("researchId") researchId: string,
    @Body() body: ResearchParticiateBodyDto,
  ) {
    //* 유저가 가진 credit, 리서치 참여시 제공 credit, 리서치 제목 을 가져옵니다
    const getUserCredit = this.mongoUserFindService.getUserCredit(
      req.user.userId,
    );
    const getResearchTitle =
      this.mongoResearchFindService.getResearchTitle(researchId);
    const getResearchCredit =
      this.mongoResearchFindService.getResearchCredit(researchId);

    const { userCredit, researchTitle, researchCredit } = await Promise.all([
      getUserCredit,
      getResearchTitle,
      getResearchCredit,
    ]).then(([userCredit, researchTitle, researchCredit]) => {
      return { userCredit, researchTitle, researchCredit };
    });

    /**
     * 참여하는 동안 리서치가 삭제된 경우,
     * 해당 상황을 처리하는 함수를 호출해 응답합니다.
     * @return 새로운 크레딧 변동내역
     */
    if (researchTitle === null || researchCredit === null) {
      const newCreditHitory = await this.participateDeletedResearch({
        userId: req.user.userId,
        userCredit,
        researchTitle: body.title,
        researchCredit: body.credit,
      });
      return { newCreditHitory };
    }

    //* 필요한 데이터 형태를 미리 만들어둡니다.
    const currentISOTime = getCurrentISOTime();
    //* 리서치 참여 정보
    const researchParticipation: ResearchParticipation = {
      researchId,
      userId: req.user.userId,
      consumedTime: body.consummedTime,
      createdAt: currentISOTime,
    };
    //* 크레딧 변동내역 정보
    const creditHistory: CreditHistory = {
      userId: req.user.userId,
      reason: researchTitle,
      type: CreditHistoryType.RESEARCH_PARTICIPATE,
      scale: researchCredit,
      isIncome: true,
      balance: userCredit + researchCredit,
      createdAt: currentISOTime,
    };

    //* User DB, Research DB에 대한 Session을 시작합니다.
    const userSession = await this.userConnection.startSession();
    const researchSession = await this.researchConnection.startSession();

    return await tryMultiTransaction(async () => {
      //* 리서치 참여자 수를 증가시키고 새로운 리서치 참여 정보를 생성합니다.
      const updateResearch = this.researchUpdateService.participateResearch(
        { researchId, researchParticipation },
        researchSession,
      );
      //* 크레딧 변동내역 생성 및 추가
      const updateUser = this.mongoUserCreateService.createCreditHistory(
        { userId: req.user.userId, creditHistory },
        userSession,
      );
      //* 위 두 함수를 동시에 실행하고
      //* 업데이트된 리서치 정보, 생성된 리서치 참여 정보, 새로 생성된 크레딧 변동내역을 가져온 후 반환합니다.
      const { updatedResearch, newResearchParticipation, newCreditHitory } =
        await Promise.all([updateResearch, updateUser]).then(
          ([
            { updatedResearch, newResearchParticipation },
            newCreditHitory,
          ]) => {
            return {
              updatedResearch,
              newResearchParticipation,
              newCreditHitory,
            };
          },
        );

      //* 최종적으로 업데이트된 리서치 정보, 생성된 리서치 참여 정보, 새로 생성된 크레딧 변동내역을 반환합니다.
      return { updatedResearch, newResearchParticipation, newCreditHitory };
    }, [userSession, researchSession]);
  }

  /**
   * @Transaction
   * 참여한 리서치가 이미 삭제된 경우,
   * 리서치 정보를 업데이트 하거나 리서치 참여 정보를 생성하는 과정은 생략하고
   * 크레딧 사용내역만 생성 후 반환합니다.
   * @return 새로운 크레딧 변동내역
   * @author 현웅
   */
  async participateDeletedResearch(param: {
    userId: string;
    userCredit: number;
    researchTitle: string;
    researchCredit: number;
  }) {
    const creditHistory: CreditHistory = {
      userId: param.userId,
      reason: param.researchTitle,
      type: CreditHistoryType.DELETED_RESEARCH_PARTICIPATE,
      scale: param.researchCredit,
      isIncome: true,
      balance: param.userCredit + param.researchCredit,
      createdAt: getCurrentISOTime(),
    };

    const userSession = await this.userConnection.startSession();

    const newCreditHitory =
      await this.mongoUserCreateService.createCreditHistory(
        {
          userId: param.userId,
          creditHistory,
        },
        userSession,
      );

    return newCreditHitory;
  }

  /**
   * @Transaction
   * 리서치를 끌올합니다.
   * @return 생성된 크레딧 사용내역, 끌올된 리서치 정보
   * @author 현웅
   */
  @Patch("pullup/:researchId")
  async pullupResearch(
    @Request() req: { user: JwtUserInfo },
    @Param("researchId") researchId: string,
    @Body() body: ResearchPullupBodyDto,
  ) {
    const userSession = await this.userConnection.startSession();
    const researchSession = await this.researchConnection.startSession();

    //* 유저가 가진 크레딧, 리서치 제목을 가져옵니다
    const getUserCredit = this.mongoUserFindService.getUserCredit(
      req.user.userId,
    );
    const getResearchTitle =
      this.mongoResearchFindService.getResearchTitle(researchId);

    const { userCredit, researchTitle } = await Promise.all([
      getUserCredit,
      getResearchTitle,
    ]).then(([userCredit, researchTitle]) => {
      return { userCredit, researchTitle };
    });

    //* 리서치 끌올을 위한 크레딧이 부족한 경우: 에러
    if (userCredit < RESEARCH_PULLUP_CREDIT)
      throw new NotEnoughCreditException();

    //* 필요한 데이터 형태를 미리 만들어둡니다.
    //* 현재 시간 (끌올 일시, 크레딧 사용내역 생성 일시)
    const currentISOTime = getCurrentISOTime();
    //* 끌올될 리서치 정보
    const research: Partial<Research> = {
      ...body, // '수정 후 끌올' 인 경우, 제목/내용/마감일이 포함되어 있습니다
      pulledupAt: currentISOTime,
    };
    //* CreditHistory 정보
    const creditHistory: CreditHistory = {
      userId: req.user.userId,
      reason: researchTitle,
      type: CreditHistoryType.RESEARCH_PULLUP,
      scale: -1 * RESEARCH_PULLUP_CREDIT,
      isIncome: false,
      balance: userCredit - RESEARCH_PULLUP_CREDIT,
      createdAt: currentISOTime,
    };

    return await tryMultiTransaction(async () => {
      //* 크레딧 사용내역을 생성하고 유저의 크레딧을 차감합니다.
      const updateUser = this.mongoUserCreateService.createCreditHistory(
        {
          userId: req.user.userId,
          creditHistory,
        },
        userSession,
      );
      //* 리서치 정보를 업데이트합니다.
      const updateResearch = this.researchUpdateService.pullupResearch(
        {
          userId: req.user.userId,
          researchId,
          research,
        },
        researchSession,
      );
      //* 위 두 함수를 동시에 실행하고 생성된 크레딧 사용내역과 끌올된 리서치 정보를 반환합니다.
      const { newCreditHitory, updatedResearch } = await Promise.all([
        updateUser,
        updateResearch,
      ]).then(([newCreditHitory, updatedResearch]) => {
        return { newCreditHitory, updatedResearch };
      });

      return { newCreditHitory, updatedResearch };
    }, [userSession, researchSession]);
  }

  /**
   * @Transaction
   * 리서치를 수정합니다.
   * @return 수정된 리서치 정보
   * @author 현웅
   */
  @Patch(":researchId")
  async updateResearch(
    @Request() req: { user: JwtUserInfo },
    @Param() param: { researchId: string },
    @Body() body: ResearchUpdateBodyDto,
  ) {
    const researchSession = await this.researchConnection.startSession();

    return await this.researchUpdateService.updateResearch(
      {
        userId: req.user.userId,
        researchId: param.researchId,
        research: body,
      },
      researchSession,
    );
  }

  /**
   * @Transaction
   * 리서치를 마감합니다.
   * TODO: 추가 크레딧이 걸린 리서치인 경우 분배
   * @author 현웅
   */
  @Patch("close/:researchId")
  async closeResearch(
    @Request() req: { user: JwtUserInfo },
    @Param("researchId") researchId: string,
  ) {
    const researchSession = await this.researchConnection.startSession();

    return await tryMultiTransaction(async () => {
      return await this.researchUpdateService.closeResearch(
        { userId: req.user.userId, researchId },
        researchSession,
      );
    }, [researchSession]);
  }
}
