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
import { PartnerUpdateService } from "src/Service";
import { MongoUserUpdateService, MongoPartnerUpdateService } from "src/Mongo";
import { JwtUserInfo } from "src/Object/Type";
import { tryMultiTransaction } from "src/Util";
import {
  MONGODB_USER_CONNECTION,
  MONGODB_PARTNER_CONNECTION,
} from "src/Constant";

@Controller("partners")
export class PartnerPatchController {
  constructor(
    private readonly partnerUpdateService: PartnerUpdateService,

    @InjectConnection(MONGODB_USER_CONNECTION)
    private readonly userConnection: Connection,
    @InjectConnection(MONGODB_PARTNER_CONNECTION)
    private readonly partnerConnection: Connection,
  ) {}

  @Inject() private readonly mongoUserUpdateService: MongoUserUpdateService;
  @Inject()
  private readonly mongoPartnerUpdateService: MongoPartnerUpdateService;

  /**
   * @Transaction
   * 파트너를 팔로우합니다.
   * @author 현웅
   */
  @Patch("follow/:partnerId")
  async followPartner(
    @Request() req: { user: JwtUserInfo },
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
    @Request() req: { user: JwtUserInfo },
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

  /**
   * 게시글/이벤트 정보를 업데이트합니다.
   * @author 현웅
   */
  @Patch("post")
  async updatePost() {
    return await this.partnerUpdateService.updatePost();
  }

  /**
   * 제품/서비스 정보를 업데이트합니다.
   * @author 현웅
   */
  @Patch("product")
  async updateProduct() {
    return await this.partnerUpdateService.updateProduct();
  }
}
