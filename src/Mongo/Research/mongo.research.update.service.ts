import { Injectable } from "@nestjs/common";
import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { Model, Connection, ClientSession } from "mongoose";
import {
  Research,
  ResearchDocument,
  ResearchParticipation,
  ResearchParticipationDocument,
  ResearchParticipantInfo,
  ResearchUser,
  ResearchUserDocument,
} from "src/Schema";
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
    @InjectModel(ResearchUser.name)
    private readonly ResearchUser: Model<ResearchUserDocument>,

    @InjectConnection(MONGODB_RESEARCH_CONNECTION)
    private readonly connection: Connection,
  ) {}

  /**
   * 조회자 정보를 추가합니다.
   * @author 현웅
   */
  async updateView(param: { userId: string; researchId: string }) {
    const updateResearch = this.Research.findByIdAndUpdate(param.researchId, {
      $inc: { viewsNum: 1 },
    });
    const updateParticipation = this.ResearchParticipation.findByIdAndUpdate(
      param.researchId,
      { $addToSet: { viewedUserIds: param.userId } },
    );

    await Promise.all([updateResearch, updateParticipation]);
    return;
  }

  /**
   * 스크랩 수를 1 늘리고 유저 _id를 추가합니다.
   * @return 업데이트된 리서치 정보
   * @author 현웅
   */
  async updateScrap(param: { userId: string; researchId: string }) {
    const updateResearch = this.Research.findByIdAndUpdate(
      param.researchId,
      { $inc: { scrapsNum: 1 } },
      { returnOriginal: false },
    )
      .populate({
        path: "author",
        model: this.ResearchUser,
      })
      .lean();

    const updateParticipation = this.ResearchParticipation.findByIdAndUpdate(
      param.researchId,
      { $addToSet: { scrappedUserIds: param.userId } },
    );

    const updatedResearch = await Promise.all([
      updateResearch,
      updateParticipation,
    ]).then(([updatedResearch, _]) => {
      return updatedResearch;
    });
    return updatedResearch;
  }

  /**
   * 스크랩 수를 1 줄이고 스크랩 유저 _id를 제거합니다.
   * @return 업데이트된 리서치 정보
   * @author 현웅
   */
  async updateUnscrap(param: { userId: string; researchId: string }) {
    const updateResearch = this.Research.findByIdAndUpdate(
      param.researchId,
      { $inc: { scrapsNum: -1 } },
      { returnOriginal: false },
    )
      .populate({
        path: "author",
        model: this.ResearchUser,
      })
      .lean();

    const updateParticipation = this.ResearchParticipation.findByIdAndUpdate(
      param.researchId,
      { $pull: { scrappedUserIds: param.userId } },
    );

    const updatedResearch = await Promise.all([
      updateResearch,
      updateParticipation,
    ]).then(([updatedResearch, _]) => {
      return updatedResearch;
    });
    return updatedResearch;
  }

  /**
   * @Transaction
   * 참여한 유저 정보를 추가합니다.
   * @return 참여 정보가 반영된 최신 리서치 정보
   * @author 현웅
   */
  async updateParticipant(
    param: { participantInfo: ResearchParticipantInfo; researchId: string },
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

    await this.ResearchParticipation.findByIdAndUpdate(
      param.researchId,
      { $push: { participantInfos: param.participantInfo } },
      { session },
    );

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
    ).lean();
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

  /**
   * @Transaction
   * 리서치를 수정합니다.
   * @author 현웅
   */
  async updateResearch(
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
    );
  }
}
