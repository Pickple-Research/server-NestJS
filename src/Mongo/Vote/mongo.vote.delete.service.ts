import { Injectable } from "@nestjs/common";
import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { Model, Connection } from "mongoose";
import {
  Vote,
  VoteDocument,
  VoteComment,
  VoteCommentDocument,
  VoteParticipation,
  VoteParticipationDocument,
  VoteReply,
  VoteReplyDocument,
} from "src/Schema";
import { MONGODB_VOTE_CONNECTION } from "src/Constant";
import { tryTransaction } from "src/Util";

@Injectable()
export class MongoVoteDeleteService {
  constructor(
    @InjectModel(Vote.name) private readonly Vote: Model<VoteDocument>,
    @InjectModel(VoteComment.name)
    private readonly VoteComment: Model<VoteCommentDocument>,
    @InjectModel(VoteParticipation.name)
    private readonly VoteParticipation: Model<VoteParticipationDocument>,
    @InjectModel(VoteReply.name)
    private readonly VoteReply: Model<VoteReplyDocument>,

    @InjectConnection(MONGODB_VOTE_CONNECTION)
    private readonly connection: Connection,
  ) {}

  /**
   * @Transaction
   * 투표를 삭제합니다.
   * @author 현웅
   */
  async deleteVoteById(voteId: string) {
    const session = await this.connection.startSession();

    return await tryTransaction(async () => {
      //* 투표 삭제
      await this.Vote.findByIdAndDelete(voteId, { session });

      //* 투표 참여자 정보 삭제 및 정보 가져오기
      const voteParticipation = await this.VoteParticipation.findByIdAndDelete(
        voteId,
        { session },
      )
        .select({ commentIds: 1 })
        .populate({
          path: "commentIds",
          model: this.VoteComment,
          select: "replyIds",
        })
        .lean();

      //* 모든 댓글 _id와 대댓글 _id를 추출
      const commentIds = voteParticipation.commentIds.map((commentId) => {
        return commentId["_id"];
      });
      const replyIds = voteParticipation.commentIds
        .map((commentId) => {
          return commentId.replyIds.map((replyId) => {
            return replyId["_id"];
          });
        })
        .flat();

      //* 댓글과 대댓글 모두 삭제
      await this.VoteComment.deleteMany(
        { _id: { $in: commentIds } },
        { session },
      );
      await this.VoteReply.deleteMany({ _id: { $in: replyIds } }, { session });

      return;
    }, session);
  }
}
