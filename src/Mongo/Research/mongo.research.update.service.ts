import { Injectable } from "@nestjs/common";
import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { Model, Connection } from "mongoose";
import {
  Research,
  ResearchDocument,
  ResearchParticipation,
  ResearchParticipationDocument,
  ResearchParticipantInfo,
} from "src/Schema";
import { tryTransaction } from "src/Util";
import { MONGODB_RESEARCH_CONNECTION } from "src/Constant";

/**
 * 리서치 데이터를 수정하는 서비스 집합입니다
 * @author 현웅
 */
@Injectable()
export class MongoResearchUpdateService {
  constructor(
    @InjectModel(Research.name)
    private readonly Research: Model<ResearchDocument>,
    @InjectModel(ResearchParticipation.name)
    private readonly ResearchParticipation: Model<ResearchParticipationDocument>,

    @InjectConnection(MONGODB_RESEARCH_CONNECTION)
    private readonly connection: Connection,
  ) {}

  /**
   * 조회자 정보를 추가합니다.
   * @author 현웅
   */
  async updateView(userId: string, researchId: string) {
    await this.ResearchParticipation.findByIdAndUpdate(researchId, {
      $addToSet: { viewedUserIds: userId },
    });

    return;
  }

  /**
   * 스크랩한 유저 _id를 추가합니다.
   * @author 현웅
   */
  async updateScrap(userId: string, researchId: string) {
    await this.ResearchParticipation.findByIdAndUpdate(researchId, {
      $addToSet: { scrappedUserIds: userId },
    });

    return;
  }

  /**
   * 스크랩 취소한 유저 _id를 제거합니다.
   * @author 현웅
   */
  async updateUnscrap(userId: string, researchId: string) {
    await this.ResearchParticipation.findByIdAndUpdate(researchId, {
      $pull: { scrappedUserIds: userId },
    });

    return;
  }

  /**
   * @Transaction
   * 참여한 유저 정보를 추가합니다.
   * @author 현웅
   */
  async updateParticipant(
    userInfo: ResearchParticipantInfo,
    researchId: string,
  ) {
    const session = await this.connection.startSession();

    return await tryTransaction(session, async () => {
      await this.ResearchParticipation.findByIdAndUpdate(
        researchId,
        { $push: { participantInfos: userInfo } },
        { session },
      );
      return;
    });
  }
}
