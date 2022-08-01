import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ClientSession } from "mongoose";
import { AwsS3Service } from "src/AWS";
import {
  Research,
  ResearchDocument,
  ResearchComment,
  ResearchCommentDocument,
  ResearchParticipation,
  ResearchParticipationDocument,
  ResearchReply,
  ResearchReplyDocument,
  ResearchScrap,
  ResearchScrapDocument,
  ResearchUser,
  ResearchUserDocument,
} from "src/Schema";
import { BUCKET_NAME } from "src/Constant";

@Injectable()
export class MongoResearchDeleteService {
  constructor(
    @InjectModel(Research.name)
    private readonly Research: Model<ResearchDocument>,
    @InjectModel(ResearchComment.name)
    private readonly ResearchComment: Model<ResearchCommentDocument>,
    @InjectModel(ResearchParticipation.name)
    private readonly ResearchParticipation: Model<ResearchParticipationDocument>,
    @InjectModel(ResearchReply.name)
    private readonly ResearchReply: Model<ResearchReplyDocument>,
    @InjectModel(ResearchScrap.name)
    private readonly ResearchScrap: Model<ResearchScrapDocument>,
    @InjectModel(ResearchUser.name)
    private readonly ResearchUser: Model<ResearchUserDocument>,

    private readonly awsS3Service: AwsS3Service,
  ) {}

  /**
   * @Transaction
   * 유저 탈퇴시, ResearchUser 정보를 함께 삭제합니다.
   * @author 현웅
   */
  async deleteResearchUser(param: { userId: string }, session: ClientSession) {
    await this.ResearchUser.findByIdAndUpdate(
      param.userId,
      { $set: { deleted: true } },
      { session },
    );
    return;
  }

  /**
   * @Transaction
   * 리서치를 삭제합니다.
   * @author 현웅
   */
  //TODO: AWS S3 오브젝트도 함께 지워야 합니다.
  async deleteResearchById(
    param: { researchId: string },
    session: ClientSession,
  ) {
    //* 리서치 삭제
    await this.Research.findByIdAndDelete(param.researchId, { session });
    //* 리서치 참여 정보 삭제
    await this.ResearchParticipation.deleteMany(
      { researchId: param.researchId },
      { session },
    );
    //* 리서치 스크랩 정보 삭제
    await this.ResearchScrap.deleteMany(
      { researchId: param.researchId },
      { session },
    );
    //* 댓글과 대댓글 모두 삭제
    await this.ResearchComment.deleteMany(
      { researchId: param.researchId },
      { session },
    );
    await this.ResearchReply.deleteMany(
      { researchId: param.researchId },
      { session },
    );

    return;
  }

  /**
   * 리서치 스크랩 취소시: 리서치 스크랩 정보를 삭제합니다.
   * @author 현웅
   */
  async deleteResearchScrap(param: { userId: string; researchId: string }) {
    return await this.ResearchScrap.findOneAndDelete({
      userId: param.userId,
      researchId: param.researchId,
    });
  }
}
