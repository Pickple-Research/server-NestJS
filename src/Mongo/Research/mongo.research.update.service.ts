import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ClientSession } from "mongoose";
import {
  Research,
  ResearchDocument,
  ResearchParticipation,
  ResearchParticipationDocument,
  ResearchUser,
  ResearchUserDocument,
} from "src/Schema";

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
    @InjectModel(ResearchUser.name)
    private readonly ResearchUser: Model<ResearchUserDocument>,
  ) {}

  /**
   * 리서치 조회수를 1 늘립니다.
   * @author 현웅
   */
  async updateView(param: { researchId: string }) {
    return await this.Research.findByIdAndUpdate(param.researchId, {
      $inc: { viewsNum: 1 },
    });
  }

  /**
   * 리서치 스크랩 수를 1 늘리거나 줄입니다.
   * @return 업데이트된 리서치 정보
   * @author 현웅
   */
  async updateScrap(param: { researchId: string; unscrap: boolean }) {
    const updatedResearch = await this.Research.findByIdAndUpdate(
      param.researchId,
      { $inc: { scrapsNum: param.unscrap ? -1 : 1 } },
      { returnOriginal: false },
    )
      .populate({
        path: "author",
        model: this.ResearchUser,
      })
      .lean();

    return updatedResearch;
  }

  /**
   * @Transaction
   * 리서치 참여자 수를 증가시킵니다.
   * @return 참여 정보가 반영된 최신 리서치 정보
   * @author 현웅
   */
  async updateParticipant(
    param: { researchId: string },
    session?: ClientSession,
  ) {
    const updatedResearch = await this.Research.findByIdAndUpdate(
      param.researchId,
      { $inc: { participantsNum: 1 } },
      { session, returnOriginal: false },
    )
      .populate({
        path: "author",
        model: this.ResearchUser,
      })
      .lean();
    return updatedResearch;
  }

  /**
   * 리서치를 끌올합니다.
   * @return 끌올된 리서치 정보
   * @author 현웅
   */
  async pullupResearch(
    param: { researchId: string; research: Partial<Research> },
    session: ClientSession,
  ) {
    const research = await this.Research.findById(param.researchId).lean();
    const updatedResearch = { ...research, ...param.research };

    return await this.Research.findByIdAndUpdate(
      param.researchId,
      updatedResearch,
      { session, returnOriginal: false },
    )
      .populate({
        path: "author",
        model: this.ResearchUser,
      })
      .lean();
  }

  /**
   * @Transaction
   * 리서치를 마감합니다.
   * @return 마감된 리서치 정보
   * @author 현웅
   */
  async closeResearch(param: { researchId: string }, session: ClientSession) {
    return await this.Research.findByIdAndUpdate(
      param.researchId,
      { $set: { closed: true } },
      { session, returnOriginal: false },
    )
      .populate({
        path: "author",
        model: this.ResearchUser,
      })
      .lean();
  }

  /**
   * @Transaction
   * 리서치를 수정합니다.
   * @return 수정된 리서치 정보
   * @author 현웅
   */
  async editResearch(
    param: { researchId: string; research: Partial<Research> },
    session: ClientSession,
  ) {
    const research = await this.Research.findById(param.researchId).lean();

    const updatedResearch = { ...research, ...param.research };

    return await this.Research.findByIdAndUpdate(
      param.researchId,
      updatedResearch,
      {
        session,
        returnOriginal: false,
      },
    )
      .populate({
        path: "author",
        model: this.ResearchUser,
      })
      .lean();
  }
}
