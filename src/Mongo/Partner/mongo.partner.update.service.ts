import { Injectable } from "@nestjs/common";
import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { Model, Connection, ClientSession } from "mongoose";
import {
  PartnerPost,
  PartnerPostDocument,
  PartnerProduct,
  PartnerProductDocument,
  PartnerActivity,
  PartnerActivityDocument,
} from "src/Schema";
import { tryTransaction } from "src/Util";
import { MONGODB_PARTNER_CONNECTION } from "src/Constant";

@Injectable()
export class MongoPartnerUpdateService {
  constructor(
    @InjectModel(PartnerPost.name)
    private readonly PartnerPost: Model<PartnerPostDocument>,
    @InjectModel(PartnerProduct.name)
    private readonly PartnerProduct: Model<PartnerProductDocument>,
    @InjectModel(PartnerActivity.name)
    private readonly PartnerActivity: Model<PartnerActivityDocument>,

    @InjectConnection(MONGODB_PARTNER_CONNECTION)
    private readonly connection: Connection,
  ) {}

  async updateProduct() {}

  async updatePost() {}

  /**
   * @Transaction
   * 파트너를 팔로우합니다.
   * @author 현웅
   */
  async updateFollower(
    userId: string,
    partnerId: string,
    session?: ClientSession,
  ) {
    await this.PartnerActivity.findByIdAndUpdate(
      partnerId,
      {
        $addToSet: { followerIds: { $each: [userId], $position: 0 } },
      },
      { session },
    );
    return;
  }

  /**
   * @Transaction
   * 파트너 팔로우를 취소합니다.
   * @author 현웅
   */
  async updateUnfollower(
    userId: string,
    partnerId: string,
    session?: ClientSession,
  ) {
    await this.PartnerActivity.findByIdAndUpdate(
      partnerId,
      {
        $pull: { followerIds: userId },
      },
      { session },
    );
    return;
  }
}
