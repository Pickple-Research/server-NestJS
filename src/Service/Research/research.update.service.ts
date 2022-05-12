import { Injectable, Inject } from "@nestjs/common";
import { MongoResearchUpdateService } from "src/Mongo";
import { ResearchParticipantInfo } from "src/Schema";

/**
 * 리서치 관련 데이터가 수정되는 경우
 * @author 현웅
 */
@Injectable()
export class ResearchUpdateService {
  constructor() {}

  @Inject()
  private readonly mongoResearchUpdateService: MongoResearchUpdateService;

  /**
   * @Patch
   * 조회 수를 1 증가시키고 리서치 조회자 정보를 추가합니다.
   * @author 현웅
   */
  async updateView(userId: string, researchId: string) {
    return await this.mongoResearchUpdateService.updateView(userId, researchId);
  }

  /**
   * @Patch
   * 스크랩 수를 1 증가시키고 스크랩 정보를 추가합니다.
   * @author 현웅
   */
  async updateScrap(userId: string, researchId: string) {
    return await this.mongoResearchUpdateService.updateScrap(
      userId,
      researchId,
    );
  }

  /**
   * @Patch
   * 스크랩 수를 1 감소시키고 스크랩 정보를 제거합니다.
   * @author 현웅
   */
  async updateUnscrap(userId: string, researchId: string) {
    return await this.mongoResearchUpdateService.updateUnscrap(
      userId,
      researchId,
    );
  }

  /**
   * @Patch
   * 참여자 수를 1 증가시키고 참여자 정보를 추가합니다.
   * @returns
   */
  async updateParticipant(
    userInfo: ResearchParticipantInfo,
    researchInfo: string,
  ) {
    return await this.mongoResearchUpdateService.updateParticipant(
      userInfo,
      researchInfo,
    );
  }
}
