import { Controller, Inject, Body, Patch } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { UserUpdateService, ResearchUpdateService } from "src/Service";
import { MongoUserFindService } from "src/Mongo";
import { ScrappedResearchInfo } from "src/Schema";
import { getCurrentISOTime, tryTransaction } from "src/Util";
import { MONGODB_USER_CONNECTION } from "src/Constant";
import { AlreadyParticipatedResearchException } from "src/Exception";

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
  @Patch("view")
  async updateResearchView(
    @Body() body: { userId: string; researchId: string },
  ) {
    const updateUser = await this.userUpdateService.viewResearch(
      body.userId,
      body.researchId,
    );

    const updateResearch = await this.researchUpdateService.updateView(
      body.userId,
      body.researchId,
    );

    await Promise.all([updateUser, updateResearch]);
    return;
  }

  /**
   * 리서치 스크랩 시 호출.
   * @author 현웅
   */
  @Patch("scrap")
  async updateResearchScrapped(
    @Body() body: { userId: string; researchId: string },
  ) {
    const updateUser = await this.userUpdateService.scrapResearch(
      body.userId,
      body.researchId,
    );

    const updateResearch = await this.researchUpdateService.updateScrap(
      body.userId,
      body.researchId,
    );

    await Promise.all([updateUser, updateResearch]);
    return;
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
      researchId: string;
    },
  ) {
    const updateUser = await this.userUpdateService.unscrapResearch(
      body.userId,
      body.researchId,
    );

    const updateResearch = await this.researchUpdateService.updateUnscrap(
      body.userId,
      body.researchId,
    );
    await Promise.all([updateUser, updateResearch]);
    return;
  }

  /**
   * 리서치 참여시 호출.
   * 조회, 스크랩과 다르게 데이터 정합성이 필요하므로 Transaction을 활용해야합니다.
   * @author 현웅
   */
  @Patch("participate")
  async updateResearchParticipant(
    @Body()
    body: {
      userId: string;
      researchId: string;
      consummedTime: string;
    },
  ) {
    //* 유저측에서 리서치에 참여한 이력이 있는 경우, 에러를 발생시킵니다.
    //TODO: tryTransaction 안에 넣어서 좀 더 빠르게 설정
    if (
      await this.mongoUserFindService.didUserParticipatedResearch(
        body.userId,
        body.researchId,
      )
    ) {
      throw new AlreadyParticipatedResearchException();
    }

    const currentISOTime = getCurrentISOTime();
    const userSession = await this.userConnection.startSession();

    return await tryTransaction(userSession, async () => {
      //* UserActivity에 리서치 참여 정보 추가
      await this.userUpdateService.participateResearch(
        userSession,
        body.userId,
        body.researchId,
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
