import { Injectable } from "@nestjs/common";
import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { Model, Connection, ClientSession } from "mongoose";
import {
  Research,
  ResearchDocument,
  ResearchParticipation,
  ResearchParticipationDocument,
  ResearchParticipantInfo,
} from "src/Schema";
import { getFutureDateFromGivenDate, tryTransaction } from "src/Util";
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
      $inc: { viewedNum: 1 },
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
      $inc: { scrappedNum: 1 },
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
      $inc: { scrappedNum: -1 },
      $pull: { scrappedUserIds: userId },
    });

    return;
  }

  /**
   * 참여한 유저 정보를 추가합니다.
   * @author 현웅
   */
  async updateParticipant(
    userInfo: ResearchParticipantInfo,
    researchId: string,
    session?: ClientSession,
  ) {
    await this.ResearchParticipation.findByIdAndUpdate(
      researchId,
      { $inc: { participantNum: 1 }, $push: { participantInfos: userInfo } },
      { session },
    );
    return;
  }

  /**
   * 리서치를 연장합니다.
   * @author 현웅
   */
  async extendResearch(researchId: string) {
    const research = await this.Research.findById(researchId);
    const updatedDeadline = getFutureDateFromGivenDate(research.deadline, 2);
    research.deadline = updatedDeadline;
    research.save();
    return;
  }

  /**
   * 리서치를 종료합니다.
   * @author 현웅
   */
  async closeResearch(researchId: string) {
    await this.Research.findByIdAndUpdate(researchId, {
      $set: { closed: true },
    });
    return;
  }
}
