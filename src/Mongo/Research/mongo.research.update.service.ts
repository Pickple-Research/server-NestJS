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
import { getFutureDateFromGivenDate } from "src/Util";
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
  async updateView(userId: string, researchId: string) {
    const updateResearch = await this.Research.findByIdAndUpdate(researchId, {
      $inc: { viewsNum: 1 },
    });
    const updateParticipation =
      await this.ResearchParticipation.findByIdAndUpdate(researchId, {
        $addToSet: { viewedUserIds: userId },
      });

    await Promise.all([updateResearch, updateParticipation]);
    return;
  }

  /**
   * 스크랩 수를 1 늘리고 유저 _id를 추가합니다.
   * @return 업데이트된 리서치 정보
   * @author 현웅
   */
  async updateScrap(userId: string, researchId: string) {
    const updateResearch = await this.Research.findByIdAndUpdate(
      researchId,
      {
        $inc: { scrapsNum: 1 },
      },
      { returnOriginal: false },
    )
      .populate({
        path: "author",
        model: this.ResearchUser,
      })
      .lean();

    const updateParticipation =
      await this.ResearchParticipation.findByIdAndUpdate(researchId, {
        $addToSet: { scrappedUserIds: userId },
      });

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
  async updateUnscrap(userId: string, researchId: string) {
    const updateResearch = await this.Research.findByIdAndUpdate(
      researchId,
      {
        $inc: { scrapsNum: -1 },
      },
      { returnOriginal: false },
    )
      .populate({
        path: "author",
        model: this.ResearchUser,
      })
      .lean();

    const updateParticipation =
      await this.ResearchParticipation.findByIdAndUpdate(researchId, {
        $pull: { scrappedUserIds: userId },
      });

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
    userInfo: ResearchParticipantInfo,
    researchId: string,
    session?: ClientSession,
  ) {
    const updatedResearch = await this.Research.findByIdAndUpdate(
      researchId,
      { $inc: { participantsNum: 1 } },
      { session, returnOriginal: false },
    )
      .populate({
        path: "author",
        model: this.ResearchUser,
      })
      .lean();

    await this.ResearchParticipation.findByIdAndUpdate(
      researchId,
      { $push: { participantInfos: userInfo } },
      { session },
    );

    return updatedResearch;
  }

  /**
   * 리서치를 끌올합니다.
   * @author 현웅
   */
  async pullupResearch(researchId: string) {
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
