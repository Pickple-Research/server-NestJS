import { Injectable } from "@nestjs/common";
import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { Model, Connection } from "mongoose";
import {
  Research,
  ResearchDocument,
  ResearchParticipation,
  ResearchParticipationDocument,
  ResearchViewedUserInfo,
  ResearchScrappedUserInfo,
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
   * 조회자 정보를 추가하고
   * 리서치 조회수를 1 늘립니다.
   * @author 현웅
   */
  async updateView(userInfo: ResearchViewedUserInfo, researchId: string) {
    //* 리서치 조회자 정보를 추가하고
    const updateParticipation =
      await this.ResearchParticipation.findByIdAndUpdate(researchId, {
        $push: { viewedUserInfos: userInfo },
      });

    //* 조회수를 1 늘립니다.
    const updateNum = await this.Research.findByIdAndUpdate(researchId, {
      $inc: { viewedNum: 1 },
    });

    await Promise.all([updateParticipation, updateNum]);
    return;
  }

  /**
   * 스크랩한 유저 정보를 추가하고
   * 리서치 스크랩 수를 1 늘립니다.
   * @author 현웅
   */
  async updateScrap(userInfo: ResearchScrappedUserInfo, researchId: string) {
    //* 스크랩한 유저 정보를 추가한 후
    const updateParticipation =
      await this.ResearchParticipation.findByIdAndUpdate(researchId, {
        $push: { scrappedUserInfos: userInfo },
      });

    //* 스크랩 수를 1 늘립니다.
    const updateNum = await this.Research.findByIdAndUpdate(researchId, {
      $inc: { scrappedNum: 1 },
    });

    await Promise.all([updateParticipation, updateNum]);
    return;
  }

  /**
   * 스크랩 취소한 유저 정보를 제거하고
   * 리서치 스크랩 수를 1 줄입니다.
   * @author 현웅
   */
  async updateUnscrap(userId: string, researchId: string) {
    //* 우선, 스크랩한 유저 정보를 제거한 배열을 새로 선언합니다.
    const researchParticipation = await this.ResearchParticipation.findById(
      researchId,
    )
      .select({ scrappedUserInfos: 1 })
      .lean();

    const updatedUserInfos = researchParticipation.scrappedUserInfos.filter(
      (info) => {
        return info.userId !== userId;
      },
    );

    //* 해당 배열로 업데이트 하고
    const updateParticipation =
      await this.ResearchParticipation.findByIdAndUpdate(researchId, {
        $set: { scrappedUserInfos: updatedUserInfos },
      });

    //* 스크랩 수를 1 줄입니다
    const updateNum = await this.Research.findByIdAndUpdate(researchId, {
      $inc: { scrappedNum: -1 },
    });

    await Promise.all([updateParticipation, updateNum]);
    return;
  }

  /**
   * @Transaction
   * 리서치 참여자 수를 1 늘리고
   * 참여한 유저 정보를 추가합니다.
   * @author 현웅
   */
  async updateParticipant(
    userInfo: ResearchParticipantInfo,
    researchId: string,
  ) {
    const session = await this.connection.startSession();

    return await tryTransaction(session, async () => {
      //*
      await this.Research.findByIdAndUpdate(
        researchId,
        { $inc: { participatedNum: 1 } },
        { session },
      );
      await this.ResearchParticipation.findByIdAndUpdate(
        researchId,
        { $push: { participantInfos: userInfo } },
        { session },
      );
      return;
    });
  }
}
