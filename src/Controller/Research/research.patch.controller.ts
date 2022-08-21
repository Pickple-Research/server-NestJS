import { Controller, Inject, Request, Body, Patch } from "@nestjs/common";
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
  ResearchView,
  ResearchScrap,
  ResearchParticipation,
  CreditHistory,
} from "src/Schema";
import { JwtUserInfo } from "src/Object/Type";
import { CreditHistoryType } from "src/Object/Enum";
import {
  ResearchInteractBodyDto,
  ResearchParticiateBodyDto,
  ResearchPullupBodyDto,
  ResearchEditBodyDto,
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
   * 리서치 조회를 요청한 유저가 이미 투표를 조회한 적이 있는 경우엔 아무 작업도 하지 않습니다.
   * @author 현웅
   */
  @Patch("view")
  async viewResearch(
    @Request() req: { user: JwtUserInfo },
    @Body() body: ResearchInteractBodyDto,
  ) {
    const researchView: ResearchView = {
      userId: req.user.userId,
      researchId: body.researchId,
      createdAt: getCurrentISOTime(),
    };

    return await this.researchUpdateService.viewResearch({
      researchView,
    });
  }

  /**
   * 리서치를 스크랩합니다.
   * @return 업데이트된 리서치 정보, 생성된 리서치 스크랩 정보
   * @author 현웅
   */
  @Patch("scrap")
  async scrapResearch(
    @Request() req: { user: JwtUserInfo },
    @Body() body: ResearchInteractBodyDto,
  ) {
    const researchScrap: ResearchScrap = {
      userId: req.user.userId,
      researchId: body.researchId,
      createdAt: getCurrentISOTime(),
    };

    const { updatedResearch, newResearchScrap } =
      await this.researchUpdateService.scrapResearch({
        researchId: body.researchId,
        researchScrap,
      });
    return { updatedResearch, newResearchScrap };
  }

  /**
   * 리서치 스크랩을 취소합니다.
   * @return 업데이트된 리서치 정보
   * @author 현웅
   */
  @Patch("unscrap")
  async unscrapResearch(
    @Request() req: { user: JwtUserInfo },
    @Body() body: ResearchInteractBodyDto,
  ) {
    const updatedResearch = await this.researchUpdateService.unscrapResearch({
      userId: req.user.userId,
      researchId: body.researchId,
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
  @Patch("participate")
  async participateResearch(
    @Request() req: { user: JwtUserInfo },
    @Body() body: ResearchParticiateBodyDto,
  ) {
    //* 유저가 가진 크레딧, 리서치 정보를 가져옵니다
    const getUser = this.mongoUserFindService.getUser({
      userId: req.user.userId,
      selectQuery: { credit: true },
    });
    const getResearch = this.mongoResearchFindService.getResearchById({
      researchId: body.researchId,
      selectQuery: { title: true, credit: true },
    });

    const { user, research } = await Promise.all([getUser, getResearch]).then(
      ([user, research]) => {
        return { user, research };
      },
    );

    /**
     * 참여하는 동안 리서치가 삭제된 경우,
     * 해당 상황을 처리하는 함수를 호출해 응답합니다.
     * @return 새로운 크레딧 변동내역
     */
    if (research === null) {
      const newCreditHistory = await this.participateDeletedResearch({
        userId: req.user.userId,
        userCredit: user.credit,
        researchTitle: body.title,
        researchCredit: body.credit,
      });
      return { newCreditHistory };
    }

    //* 필요한 데이터 형태를 미리 만들어둡니다.
    const currentISOTime = getCurrentISOTime();
    //* 리서치 참여 정보
    const researchParticipation: ResearchParticipation = {
      researchId: body.researchId,
      userId: req.user.userId,
      consumedTime: body.consumedTime,
      createdAt: body.createdAt ? body.createdAt : currentISOTime,
    };
    //* 크레딧 변동내역 정보
    const creditHistory: CreditHistory = {
      userId: req.user.userId,
      reason: research.title,
      type: CreditHistoryType.RESEARCH_PARTICIPATE,
      scale: research.credit,
      isIncome: true,
      balance: user.credit + research.credit,
      createdAt: body.createdAt ? body.createdAt : currentISOTime,
    };

    //* User DB, Research DB에 대한 Session을 시작합니다.
    const userSession = await this.userConnection.startSession();
    const researchSession = await this.researchConnection.startSession();

    return await tryMultiTransaction(async () => {
      //* 리서치 참여자 수를 증가시키고 새로운 리서치 참여 정보를 생성합니다.
      const updateResearch = this.researchUpdateService.participateResearch(
        { researchId: body.researchId, researchParticipation },
        researchSession,
      );
      //* 크레딧 변동내역 생성 및 추가
      const updateUser = this.mongoUserCreateService.createCreditHistory(
        { userId: req.user.userId, creditHistory },
        userSession,
      );
      //* 위 두 함수를 동시에 실행하고
      //* 업데이트된 리서치 정보, 생성된 리서치 참여 정보, 새로 생성된 크레딧 변동내역을 가져온 후 반환합니다.
      const { updatedResearch, newResearchParticipation, newCreditHistory } =
        await Promise.all([updateResearch, updateUser]).then(
          ([
            { updatedResearch, newResearchParticipation },
            newCreditHistory,
          ]) => {
            return {
              updatedResearch,
              newResearchParticipation,
              newCreditHistory,
            };
          },
        );

      //* 최종적으로 업데이트된 리서치 정보, 생성된 리서치 참여 정보, 새로 생성된 크레딧 변동내역을 반환합니다.
      return { updatedResearch, newResearchParticipation, newCreditHistory };
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

    const newCreditHistory =
      await this.mongoUserCreateService.createCreditHistory(
        {
          userId: param.userId,
          creditHistory,
        },
        userSession,
      );

    return newCreditHistory;
  }

  /**
   * @Transaction
   * 리서치를 끌올합니다.
   * @return 생성된 크레딧 사용내역, 끌올된 리서치 정보
   * @author 현웅
   */
  @Patch("pullup")
  async pullupResearch(
    @Request() req: { user: JwtUserInfo },
    @Body() body: ResearchPullupBodyDto,
  ) {
    //* 유저가 가진 크레딧, 리서치 정보를 가져옵니다
    const getUser = this.mongoUserFindService.getUser({
      userId: req.user.userId,
      selectQuery: { credit: true },
    });
    const getResearch = this.mongoResearchFindService.getResearchById({
      researchId: body.researchId,
      selectQuery: {
        title: true,
        deadline: true,
        extraCredit: true,
        extraCreditReceiverNum: true,
      },
    });

    const { user, previousResearch } = await Promise.all([
      getUser,
      getResearch,
    ]).then(([user, previousResearch]) => {
      return { user, previousResearch };
    });

    //* 리서치 끌올에 필요한 크레딧 계산
    const requiredCredit =
      RESEARCH_PULLUP_CREDIT +
      ((body.extraCredit ? body.extraCredit : 0) *
        (body.extraCreditReceiverNum ? body.extraCreditReceiverNum : 0) -
        previousResearch.extraCreditReceiverNum * previousResearch.extraCredit);

    //* 리서치 끌올을 위한 크레딧이 부족한 경우: 에러
    if (user.credit < requiredCredit) throw new NotEnoughCreditException();

    //* 필요한 데이터 형태를 미리 만들어둡니다.
    //* 현재 시간 (끌올 일시, 크레딧 사용내역 생성 일시)
    const currentISOTime = getCurrentISOTime();
    //* 끌올될 리서치 정보
    const research: Partial<Research> = {
      ...body, // '수정 후 끌올' 인 경우, 제목/내용/마감일/추가 증정 크레딧이 포함되어 있습니다
      pulledupAt: currentISOTime,
    };
    //* CreditHistory 정보
    const creditHistory: CreditHistory = {
      userId: req.user.userId,
      reason: previousResearch.title,
      type: CreditHistoryType.RESEARCH_PULLUP,
      scale: -1 * requiredCredit,
      isIncome: false,
      balance: user.credit - requiredCredit,
      createdAt: currentISOTime,
    };

    const userSession = await this.userConnection.startSession();
    const researchSession = await this.researchConnection.startSession();

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
          researchId: body.researchId,
          research,
        },
        researchSession,
      );
      //* 위 두 함수를 동시에 실행하고 생성된 크레딧 사용내역과 끌올된 리서치 정보를 반환합니다.
      const { newCreditHistory, updatedResearch } = await Promise.all([
        updateUser,
        updateResearch,
      ]).then(([newCreditHistory, updatedResearch]) => {
        return { newCreditHistory, updatedResearch };
      });

      //* 이 때, 끌올 이전의 리서치가 마감일을 가질 경우 해당 자동 마감 CronJob 을 삭제합니다.
      if (Boolean(previousResearch.deadline)) {
        this.researchUpdateService.deleteResearchAutoCloseCronJob({
          researchId: previousResearch._id,
        });
      }
      //* 끌올 이후의 리서치가 마감일을 가질 경우 자동 마감 CronJob 을 추가합니다.
      if (Boolean(updatedResearch.deadline)) {
        this.researchUpdateService.addResearchAutoCloseCronJob({
          researchId: updatedResearch._id,
          deadline: updatedResearch.deadline,
        });
      }

      return { newCreditHistory, updatedResearch };
    }, [userSession, researchSession]);
  }

  /**
   * @Transaction
   * 리서치를 수정합니다.
   * @return 수정된 리서치 정보 (생성된 크레딧 사용내역)?
   * @author 현웅
   */
  @Patch("")
  async editResearch(
    @Request() req: { user: JwtUserInfo },
    @Body() body: ResearchEditBodyDto,
  ) {
    //* 유저가 가진 크레딧, 리서치 정보를 가져옵니다
    const getUser = this.mongoUserFindService.getUser({
      userId: req.user.userId,
      selectQuery: { credit: true },
    });
    const getResearch = this.mongoResearchFindService.getResearchById({
      researchId: body.researchId,
    });

    const { user, previousResearch } = await Promise.all([
      getUser,
      getResearch,
    ]).then(([user, previousResearch]) => {
      return { user, previousResearch };
    });

    //* 리서치 수정에 필요한 크레딧 계산
    const requiredCredit =
      body.extraCredit * body.extraCreditReceiverNum -
      previousResearch.extraCreditReceiverNum * previousResearch.extraCredit;

    //* 리서치 수정을 위한 크레딧이 부족한 경우: 에러
    if (user.credit < requiredCredit) throw new NotEnoughCreditException();

    //* 만약 리서치 수정에 추가로 크레딧이 소모되는 경우,
    //* 크레딧 사용내역을 추가로 생성하여 반환합니다.
    if (requiredCredit > 0) {
      const creditHistory: CreditHistory = {
        userId: req.user.userId,
        reason: previousResearch.title,
        type: CreditHistoryType.RESEARCH_EDIT,
        scale: -1 * requiredCredit,
        isIncome: false,
        balance: user.credit - requiredCredit,
        createdAt: getCurrentISOTime(),
      };

      return await this.editResearchWithExtraCredit({
        userId: req.user.userId,
        researchId: body.researchId,
        research: body,
        creditHistory,
      });
    }

    //* 리서치 수정에 크레딧이 필요하지 않다면 리서치만 수정 후 수정된 리서치만 반환합니다.
    const researchSession = await this.researchConnection.startSession();

    return await tryMultiTransaction(async () => {
      const updatedResearch = await this.researchUpdateService.editResearch(
        {
          userId: req.user.userId,
          researchId: body.researchId,
          research: body,
        },
        researchSession,
      );

      return { updatedResearch };
    }, [researchSession]);
  }

  /**
   * 리서치 수정 중 추가 증정 크레딧 조정을 위해 크레딧 소모가 발생하는 경우 호출됩니다.
   * @return 생성된 크레딧 사용내역, 수정된 리서치 정보
   * @author 현웅
   */
  async editResearchWithExtraCredit(param: {
    userId: string;
    researchId: string;
    research: Partial<Research>;
    creditHistory: CreditHistory;
  }) {
    const userSession = await this.userConnection.startSession();
    const researchSession = await this.researchConnection.startSession();

    return await tryMultiTransaction(async () => {
      //* 크레딧 사용내역을 생성하고 유저의 크레딧을 차감합니다.
      const updateUser = this.mongoUserCreateService.createCreditHistory(
        {
          userId: param.userId,
          creditHistory: param.creditHistory,
        },
        userSession,
      );
      //* 리서치 정보를 수정합니다.
      const updateResearch = this.researchUpdateService.editResearch(
        {
          userId: param.userId,
          researchId: param.researchId,
          research: param.research,
        },
        researchSession,
      );
      //* 위 두 함수를 동시에 실행하고 생성된 크레딧 사용내역과 끌올된 리서치 정보를 반환합니다.
      const { newCreditHistory, updatedResearch } = await Promise.all([
        updateUser,
        updateResearch,
      ]).then(([newCreditHistory, updatedResearch]) => {
        return { newCreditHistory, updatedResearch };
      });

      return { newCreditHistory, updatedResearch };
    }, [userSession, researchSession]);
  }

  /**
   * @Transaction
   * 리서치를 마감합니다.
   * @return 업데이트된 리서치 정보
   * @author 현웅
   */
  @Patch("close")
  async closeResearch(
    @Request() req: { user: JwtUserInfo },
    @Body() body: ResearchInteractBodyDto,
  ) {
    const researchSession = await this.researchConnection.startSession();

    const updatedResearch = await tryMultiTransaction(async () => {
      return await this.researchUpdateService.closeResearch(
        { userId: req.user.userId, researchId: body.researchId },
        researchSession,
      );
    }, [researchSession]);

    return updatedResearch;
  }
}
