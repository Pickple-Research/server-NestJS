import { Controller, Inject, Body, Patch } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { UserUpdateService, ResearchUpdateService } from "src/Service";
import { MongoUserFindService } from "src/Mongo";
import { ScrappedResearchInfo } from "src/Schema";
import { getCurrentISOTime, tryTransaction } from "src/Util";
import { MONGODB_USER_CONNECTION } from "src/Constant";

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
  ) {}

  @Inject() private readonly mongoUserFindService: MongoUserFindService;

  /**
   * 리서치 조회 시 호출.
   * @author 현웅
   */
  //TODO: #QUERY-EFFICIENCY
  @Patch("view")
  async updateResearchView(
    @Body() body: { userId: string; researchId: string },
  ) {
    // 유저측에서 리서치를 조회한 이력이 있는 경우, 아무런 작업도 하지 않습니다.
    if (
      await this.mongoUserFindService.didUserViewedResearch(
        body.userId,
        body.researchId,
      )
    ) {
      return;
    }

    const userSession = await this.userConnection.startSession();

    return await tryTransaction(userSession, async () => {
      await this.userUpdateService.viewResearch(
        userSession,
        body.userId,
        body.researchId,
      );

      await this.researchUpdateService.updateView(
        { userId: body.userId, viewedAt: getCurrentISOTime() },
        body.researchId,
      );

      return;
    });
  }

  /**
   * 리서치 스크랩 시 호출.
   * @author 현웅
   */
  @Patch("scrap")
  async updateResearchScrapped(
    @Body() body: { userId: string; researchId: string; researchTitle: string },
  ) {
    const currentISOTime = getCurrentISOTime();
    const userSession = await this.userConnection.startSession();

    return await tryTransaction(userSession, async () => {
      await this.userUpdateService.scrapResearch(userSession, body.userId, {
        researchId: body.researchId,
        title: body.researchTitle,
        scrappedAt: currentISOTime,
      });

      await this.researchUpdateService.updateScrap(
        {
          userId: body.userId,
          scrappedAt: currentISOTime,
        },
        body.researchId,
      );
    });
  }

  /**
   * 리서치 스크랩 취소 시 호출
   * @author 현웅
   */
  @Patch("unscrap")
  async updateResearchUnscrapped(
    @Body()
    body: {
      userId: string;
      researchInfo: ScrappedResearchInfo;
    },
  ) {
    const userSession = await this.userConnection.startSession();

    return await tryTransaction(userSession, async () => {
      await this.userUpdateService.unscrapResearch(
        userSession,
        body.userId,
        body.researchInfo,
      );

      await this.researchUpdateService.updateUnscrap(
        body.userId,
        body.researchInfo.researchId,
      );

      return;
    });
  }

  /**
   * 리서치 참여시 호출.
   * @author 현웅
   */
  @Patch("participate")
  async updateResearchParticipant(
    @Body()
    body: {
      userId: string;
      consummedTime: string;
      researchId: string;
      researchTitle: string;
    },
  ) {
    // 유저측에서 리서치에 참여한 이력이 있는 경우,
    //TODO: 에러를 발생시킵니다.
    if (
      await this.mongoUserFindService.didUserParticipatedResearch(
        body.userId,
        body.researchId,
      )
    ) {
      return;
    }

    const currentISOTime = getCurrentISOTime();
    const userSession = await this.userConnection.startSession();

    return await tryTransaction(userSession, async () => {
      //* UserActivity에 리서치 참여 정보 추가
      await this.userUpdateService.participateResearch(
        userSession,
        body.userId,
        {
          researchId: body.researchId,
          title: body.researchTitle,
          participatedAt: currentISOTime,
        },
      );

      //* Research와 ResearchParticipation에 참여자 정보 추가
      await this.researchUpdateService.updateParticipant(
        {
          userId: body.userId,
          consumedTime: body.consummedTime,
          participatedAt: currentISOTime,
        },
        body.researchId,
      );

      return;
    });
  }
}
