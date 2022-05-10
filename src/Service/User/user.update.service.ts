import { Injectable, Inject } from "@nestjs/common";
import { ClientSession } from "mongoose";
import { MongoUserUpdateService } from "src/Mongo";
import { ParticipatedResearchInfo, ScrappedResearchInfo } from "src/Schema";

@Injectable()
export class UserUpdateService {
  constructor() {}

  @Inject() private readonly mongoUserUpdateService: MongoUserUpdateService;

  /**
   * 조회한 리서치 _id를 UserActivity에 추가합니다.
   * @author 현웅
   */
  async viewResearch(userId: string, researchId: string) {
    return await this.mongoUserUpdateService.updateViewedResearch(
      userId,
      researchId,
    );
  }

  /**
   * 리서치를 새로 스크랩합니다.
   * @author 현웅
   */
  async scrapResearch(userId: string, researchInfo: ScrappedResearchInfo) {
    return await this.mongoUserUpdateService.scrapResearch(
      userId,
      researchInfo,
    );
  }

  /**
   * 스크랩한 리서치를 제거합니다.
   * @author 현웅
   */
  async unscrapResearch(userId: string, researchInfo: ScrappedResearchInfo) {
    return await this.mongoUserUpdateService.unscrapResearch(
      userId,
      researchInfo,
    );
  }

  /**
   * 참여한 리서치 정보를 UserActivity에 추가합니다.
   * @author 현웅
   */
  async participateResearch(
    session: ClientSession,
    userId: string,
    researchInfo: ParticipatedResearchInfo,
  ) {
    return await this.mongoUserUpdateService.participateResearch(
      session,
      userId,
      researchInfo,
    );
  }
}
