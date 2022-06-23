import { Injectable } from "@nestjs/common";
import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { Model, Connection, ClientSession } from "mongoose";
import {
  User,
  UserDocument,
  UserActivity,
  UserActivityDocument,
  UserCreditHistory,
  UserCreditHistoryDocument,
} from "src/Schema";

import { ParticipatedResearchInfo, ParticipatedVoteInfo } from "src/Schema";
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
  async viewResearch(userId: string, researchId: string) {
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
      $addToSet: { scrappedResearchIds: researchId },
    });
    return;
  }

  /**
   * 스크랩한 리서치를 제거합니다.
   * @author 현웅
   */
  async unscrapResearch(userId: string, researchId: string) {
    await this.UserActivity.findByIdAndUpdate(userId, {
      $pull: { scrappedResearchIds: researchId },
    });
    return;
  }

  /**
   * 리서치에 참여합니다. UserActivity를 업데이트하고
   * TODO: 크레딧을 증가시킵니다.
   * @author 현웅
   */
  async participateResearch(
    userId: string,
    participatedResearchInfo: ParticipatedResearchInfo,
    session?: ClientSession,
  ) {
    await this.UserActivity.findByIdAndUpdate(
      userId,
      {
        $push: {
          participatedResearchInfos: {
            $each: [participatedResearchInfo],
            $position: 0,
          },
        },
      },
      { session },
    );
    return;
  }

  /**
   * @Transaction
   * 리서치를 업로드합니다.
   * UserActivity의 uploadedResearchIds에 리서치 _id를 추가하고 유저 크레딧을 감소시킵니다.
   * @author 현웅
   */
  async uploadResearch(
    userId: string,
    researchId: string,
    session: ClientSession,
  ) {
    await tryTransaction(async () => {
      await this.UserActivity.findByIdAndUpdate(
        userId,
        {
          $push: { uploadedResearchIds: { $each: [researchId], $position: 0 } },
        },
        { session },
      );
      await this.UserCreditHistory.findByIdAndUpdate(userId, { $push: {} });
      return;
    }, session);
    return;
  }

  /**
   * 조회한 리서치 _id를 UserActivity에 추가합니다.
   * @author 현웅
   */
  async viewVote(userId: string, voteId: string) {
    await this.UserActivity.findOneAndUpdate(
      { _id: userId },
      //? $addToSet: 추가하려는 원소가 이미 존재하면 push하지 않습니다.
      { $addToSet: { viewedVoteIds: voteId } },
    );
    return;
  }

  /**
   * 리서치를 새로 스크랩합니다.
   * @author 현웅
   */
  async scrapVote(userId: string, voteId: string) {
    await this.UserActivity.findByIdAndUpdate(userId, {
      $addToSet: { scrappedVoteIds: voteId },
    });
    return;
  }

  /**
   * 스크랩한 리서치를 제거합니다.
   * @author 현웅
   */
  async unscrapVote(userId: string, voteId: string) {
    await this.UserActivity.findByIdAndUpdate(userId, {
      $pull: { scrappedVoteIds: voteId },
    });
    return;
  }

  /**
   * 투표에 참여합니다. UserActivity를 업데이트합니다.
   * @author 현웅
   */
  async participateVote(
    userId: string,
    participatedVoteInfo: ParticipatedVoteInfo,
    session?: ClientSession,
  ) {
    await this.UserActivity.findByIdAndUpdate(
      userId,
      {
        $push: {
          participatedVoteInfos: {
            $each: [participatedVoteInfo],
            $position: 0,
          },
        },
      },
      { session },
    );
    return;
  }

  /**
   * 투표를 업로드합니다.
   * UserActivity의 uploadedVoteIds에 투표 _id를 추가합니다.
   * @author 현웅
   */
  async uploadVote(userId: string, voteId: string) {
    await this.UserActivity.findByIdAndUpdate(userId, {
      $push: { uploadedVoteIds: { $each: [voteId], $position: 0 } },
    });
    return;
  }

  /**
   * @Transaction
   * 본인이 업로드한 리서치를 삭제합니다.
   * 유저 활동 정보에서 uploadedResearchIds를 찾고, 인자로 받은 researchId를 제거합니다.
   * @author 현웅
   */
  async deleteUploadedResearch(
    param: { userId: string; researchId: string },
    session: ClientSession,
  ) {
    await this.UserActivity.findByIdAndUpdate(
      param.userId,
      {
        $pull: { uploadedResearchIds: param.researchId },
      },
      { session },
    );
    return;
  }

  /**
   * @Transaction
   * 본인이 업로드한 투표를 삭제합니다.
   * 유저 활동 정보에서 uploadedVoteIds를 찾고, 인자로 받은 voteId를 제거합니다.
   * @author 현웅
   */
  async deleteUploadedVote(
    param: { userId: string; voteId: string },
    session: ClientSession,
  ) {
    await this.UserActivity.findByIdAndUpdate(
      param.userId,
      {
        $pull: { uploadedVoteIds: param.voteId },
      },
      { session },
    );
    return;
  }

  async followPartner(
    param: { userId: string; partnerId: string },
    session?: ClientSession,
  ) {
    return "follow";
  }

  async unfollowPartner(
    param: { userId: string; partnerId: string },
    session?: ClientSession,
  ) {
    return "unfollow";
  }
}
