import { Injectable } from "@nestjs/common";
import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { Model, Types, Connection, ClientSession } from "mongoose";
import {
  User,
  UserDocument,
  UserActivity,
  UserActivityDocument,
  UserCreditHistory,
  UserCreditHistoryDocument,
  ScrappedResearchInfo,
  ParticipatedResearchInfo,
} from "src/Schema";
import { MONGODB_USER_CONNECTION } from "src/Constant";
import { tryTransaction } from "src/Util";

@Injectable()
export class MongoUserUpdateService {
  constructor(
    @InjectModel(User.name) private readonly User: Model<UserDocument>,
    @InjectModel(UserActivity.name)
    private readonly UserActivity: Model<UserActivityDocument>,
    @InjectModel(UserCreditHistory.name)
    private readonly UserCreditHistory: Model<UserCreditHistoryDocument>,

    @InjectConnection(MONGODB_USER_CONNECTION)
    private readonly connection: Connection,
  ) {}

  /**
   * 조회한 리서치 _id를 UserActivity에 추가합니다.
   * @author 현웅
   */
  async updateViewedResearch(userId: string, researchId: string) {
    await this.UserActivity.findOneAndUpdate(
      { _id: userId },
      //? $addToSet: 추가하려는 원소가 이미 존재하면 push하지 않습니다.
      { $addToSet: { viewedResearchIds: researchId } },
    );
    return;
  }

  /**
   * 리서치를 새로 스크랩합니다.
   * @author 현웅
   */
  async scrapResearch(userId: string, researchId: string) {
    await this.UserActivity.findByIdAndUpdate(userId, {
      $addToSet: { scrappedResearchInfos: researchId },
    });
    return;
  }

  /**
   * 스크랩한 리서치를 제거합니다.
   * @author 현웅
   */
  async unscrapResearch(userId: string, researchId: string) {
    await this.UserActivity.findByIdAndUpdate(userId, {
      $pull: { scrappedResearchInfos: researchId },
    });
    return;
  }

  /**
   * 리서치에 참여합니다. UserActivity를 업데이트하고
   * TODO: 크레딧을 증가시킵니다.
   * @author 현웅
   */
  async participateResearch(
    session: ClientSession,
    userId: string,
    researchId: string,
  ) {
    await this.UserActivity.findByIdAndUpdate(
      userId,
      {
        $addToSet: {
          participatedResearchIds: researchId,
        },
      },
      { session },
    );
  }

  /**
   * @Transaction
   * 리서치를 업로드합니다.
   * UserActivity의 uploadedResearchIds에 Id를 추가하고 크레딧을 감소시킵니다.
   * @author 현웅
   */
  async uploadResearch(
    session: ClientSession,
    userId: string,
    researchId: string,
  ) {
    await tryTransaction(session, async () => {
      await this.UserActivity.findByIdAndUpdate(
        userId,
        { $addToSet: { uploadedResearchIds: researchId } },
        { session },
      );
      await this.UserCreditHistory.findByIdAndUpdate(userId, { $push: {} });
      return;
    });
    return;
  }
}
