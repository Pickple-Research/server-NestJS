import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ClientSession } from "mongoose";
import {
  User,
  UserDocument,
  UserActivity,
  UserActivityDocument,
  ScrappedResearchInfo,
  ParticipatedResearchInfo,
} from "src/Schema";

@Injectable()
export class MongoUserUpdateService {
  constructor(
    @InjectModel(User.name) private readonly User: Model<UserDocument>,
    @InjectModel(UserActivity.name)
    private readonly UserActivity: Model<UserActivityDocument>,
  ) {}

  /**
   * 조회한 리서치 _id를 UserActivity에 추가합니다.
   * @author 현웅
   */
  async updateViewedResearch(
    session: ClientSession,
    userId: string,
    researchId: string,
  ) {
    await this.UserActivity.findOneAndUpdate(
      { _id: userId },
      //? $addToSet: 추가하려는 원소가 이미 존재하면 push하지 않습니다.
      { $addToSet: { viewedResearchIds: researchId } },
      { session },
    );
    return;
  }

  /**
   * 리서치를 새로 스크랩합니다.
   * @author 현웅
   */
  async scrapResearch(
    session: ClientSession,
    userId: string,
    researchInfo: ScrappedResearchInfo,
  ) {
    await this.UserActivity.findByIdAndUpdate(
      userId,
      { $push: { scrappedResearchInfos: researchInfo } },
      { session },
    );
    return;
  }

  /**
   * 스크랩한 리서치를 제거합니다.
   * @author 현웅
   */
  async unscrapResearch(
    session: ClientSession,
    userId: string,
    researchInfo: ScrappedResearchInfo,
  ) {
    await this.UserActivity.findByIdAndUpdate(
      userId,
      { $pull: { scrappedResearchInfos: researchInfo } },
      { session },
    );
    return;
  }

  /**
   * 참여한 리서치 정보를 추가합니다.
   * @author 현웅
   */
  async participateResearch(
    session: ClientSession,
    userId: string,
    researchInfo: ParticipatedResearchInfo,
  ) {
    await this.UserActivity.findByIdAndUpdate(
      userId,
      {
        $push: {
          participatedResearchInfos: researchInfo,
        },
      },
      { session },
    );
  }
}
