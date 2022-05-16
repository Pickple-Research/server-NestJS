import {
  Controller,
  Inject,
  Patch,
  Request,
  Param,
  Body,
} from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import {
  MongoUserFindService,
  MongoUserUpdateService,
  MongoResearchUpdateService,
  MongoPartnerUpdateService,
} from "src/Mongo";
import { RequestUser } from "src/Object/Type";
import { getCurrentISOTime, tryMultiTransaction } from "src/Util";
import {
  MONGODB_USER_CONNECTION,
  MONGODB_RESEARCH_CONNECTION,
  MONGODB_PARTNER_CONNECTION,
} from "src/Constant";

@Controller("users")
export class UserPatchController {
  constructor(
    @InjectConnection(MONGODB_USER_CONNECTION)
    private readonly userConnection: Connection,
    @InjectConnection(MONGODB_RESEARCH_CONNECTION)
    private readonly researchConnection: Connection,
    @InjectConnection(MONGODB_PARTNER_CONNECTION)
    private readonly partnerConnection: Connection,
  ) {}

  @Inject() private readonly mongoUserFindService: MongoUserFindService;
  @Inject() private readonly mongoUserUpdateService: MongoUserUpdateService;
  @Inject()
  private readonly mongoResearchUpdateService: MongoResearchUpdateService;
  @Inject()
  private readonly mongoPartnerUpdateService: MongoPartnerUpdateService;

  /**
   * 리서치를 조회합니다.
   * @author 현웅
   */
  @Patch("view/:researchId")
  async viewResearch(
    @Request() req: { user: RequestUser },
    @Param() param: { researchId: string },
  ) {
    const updateUser = await this.mongoUserUpdateService.viewResearch(
      req.user.userId,
      param.researchId,
    );
    const updateResearch = await this.mongoResearchUpdateService.updateView(
      req.user.userId,
      param.researchId,
    );
    await Promise.all([updateUser, updateResearch]);
    return;
  }

  /**
   * 리서치를 스크랩합니다.
   * @author 현웅
   */
  @Patch("scrap/:researchId")
  async scrapResearch(
    @Request() req: { user: RequestUser },
    @Param() param: { researchId: string },
  ) {
    const updateUser = await this.mongoUserUpdateService.scrapResearch(
      req.user.userId,
      param.researchId,
    );
    const updateResearch = await this.mongoResearchUpdateService.updateScrap(
      req.user.userId,
      param.researchId,
    );
    await Promise.all([updateUser, updateResearch]);
    return;
  }

  /**
   * 리서치 스크랩을 취소합니다.
   * @author 현웅
   */
  @Patch("unscrap/:researchId")
  async unscrapResearch(
    @Request() req: { user: RequestUser },
    @Param() param: { researchId: string },
  ) {
    const updateUser = await this.mongoUserUpdateService.unscrapResearch(
      req.user.userId,
      param.researchId,
    );

    const updateResearch = await this.mongoResearchUpdateService.updateUnscrap(
      req.user.userId,
      param.researchId,
    );
    await Promise.all([updateUser, updateResearch]);
    return;
  }

  /**
   * @Transaction
   * 리서치에 참여합니다.
   * 조회, 스크랩과 다르게 데이터 정합성이 필요하므로 Transaction을 활용해야합니다.
   * @author 현웅
   */
  @Patch("participate/:researchId")
  async participateResearch(
    // @Request() req: { user: RequestUser },
    @Param() param: { researchId: string },
    @Body() body: { userId: string; consummedTime: string },
  ) {
    const currentISOTime = getCurrentISOTime();
    //* User DB, Research DB에 대한 Session을 시작하고
    const userSession = await this.userConnection.startSession();
    const researchSession = await this.researchConnection.startSession();

    return await tryMultiTransaction(
      [userSession, researchSession],
      async () => {
        //* 유저가 이미 리서치에 참여했었는지 확인합니다.
        //* 유저 정보가 존재하지 않거나 이미 참여한 경우 에러가 발생하며,
        //* 아래의 updateUser와 updateResearch를 통한 변화가 무시됩니다.
        const checkAlreadyParticipated =
          await this.mongoUserFindService.didUserParticipatedResearch(
            // req.user.userId,
            body.userId,
            param.researchId,
            true,
          );

        //* UserActivity에 리서치 참여 정보 추가
        const updateUser =
          await this.mongoUserUpdateService.participateResearch(
            // req.user.userId,
            body.userId,
            param.researchId,
            userSession,
          );

        //* ResearchParticipation에 참여자 정보 추가
        const updateResearch =
          await this.mongoResearchUpdateService.updateParticipant(
            {
              // userId: req.user.userId,
              userId: body.userId,
              consumedTime: body.consummedTime,
              participatedAt: currentISOTime,
            },
            param.researchId,
            researchSession,
          );

        //* 위 세 개의 함수를 한꺼번에 실행합니다.
        //* 셋 중 하나라도 에러가 발생하면 변경사항이 반영되지 않습니다.
        await Promise.all([
          checkAlreadyParticipated,
          updateUser,
          updateResearch,
        ]);
        return;
      },
    );
  }

  /**
   * @Transaction
   * 파트너를 팔로우합니다.
   * @author 현웅
   */
  @Patch("follow/:partnerId")
  async followPartner(
    @Request() req: { user: RequestUser },
    @Param() param: { partnerId: string },
  ) {
    //* User DB, Partner DB에 대한 Session을 시작하고
    const userSession = await this.userConnection.startSession();
    const partnerSession = await this.partnerConnection.startSession();
    return await tryMultiTransaction(
      [userSession, partnerSession],
      async () => {
        const updateUser = await this.mongoUserUpdateService.followPartner(
          req.user.userId,
          param.partnerId,
          userSession,
        );
        const updatePartner =
          await this.mongoPartnerUpdateService.updateFollower(
            req.user.userId,
            param.partnerId,
            partnerSession,
          );
        //* Promise.all 을 이용해 두 작업을 동시에 수행합니다.
        await Promise.all([updateUser, updatePartner]);
        return;
      },
    );
  }

  /**
   * @Transaction
   * 파트너 팔로우를 취소합니다.
   * @author 현웅
   */
  @Patch("unfollow/:partnerId")
  async unfollowPartner(
    @Request() req: { user: RequestUser },
    @Param() param: { partnerId: string },
  ) {
    //* User DB, Partner DB에 대한 Session을 시작하고
    const userSession = await this.userConnection.startSession();
    const partnerSession = await this.partnerConnection.startSession();
    return await tryMultiTransaction(
      [userSession, partnerSession],
      async () => {
        const updateUser = await this.mongoUserUpdateService.unfollowPartner(
          req.user.userId,
          param.partnerId,
          userSession,
        );
        const updatePartner =
          await this.mongoPartnerUpdateService.updateUnfollower(
            req.user.userId,
            param.partnerId,
            partnerSession,
          );
        //* Promise.all 을 이용해 두 작업을 동시에 수행합니다.
        await Promise.all([updateUser, updatePartner]);
        return;
      },
    );
  }
}
