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

    private readonly awsS3Service: AwsS3Service,
  ) {}

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
    //* 리서치 기본 데이터를 삭제합니다.
    await this.Research.findByIdAndDelete(param.researchId, { session });

    //* 리서치 참여자 정보를 삭제하며 댓글 및 대댓글 정보를 모두 가져옵니다.
    const researchParticipation =
      await this.ResearchParticipation.findByIdAndDelete(param.researchId, {
        session,
      })
        .select({ comments: 1 })
        .populate({
          path: "comments",
          model: this.ResearchComment,
          select: "replies",
        })
        .lean();

    //* 모든 댓글 _id와 대댓글 _id를 추출
    const commentIds = researchParticipation.comments.map((comment) => {
      return comment["_id"];
    });
    const replyIds = researchParticipation.comments
      .map((comment) => {
        return comment.replies.map((reply) => {
          return reply["_id"];
        });
      })
      .flat();

    //* 댓글과 대댓글 모두 삭제
    await this.ResearchComment.deleteMany(
      { _id: { $in: commentIds } },
      { session },
    );
    await this.ResearchReply.deleteMany(
      { _id: { $in: replyIds } },
      { session },
    );

    return;
  }
}
