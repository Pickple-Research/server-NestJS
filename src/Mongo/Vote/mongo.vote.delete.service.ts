import { Injectable } from "@nestjs/common";
import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { Model, Connection, ClientSession } from "mongoose";
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
  async deleteVoteById(param: { voteId: string }, session: ClientSession) {
    //* 투표 삭제
    await this.Vote.findByIdAndDelete(param.voteId, { session });

    //* 투표 참여자 정보 삭제 및 정보 가져오기
    const voteParticipation = await this.VoteParticipation.findByIdAndDelete(
      param.voteId,
      { session },
    )
      .select({ comments: 1 })
      .populate({
        path: "comments",
        model: this.VoteComment,
        select: "replies",
      })
      .lean();

    //* 모든 댓글 _id와 대댓글 _id를 추출
    const commentIds = voteParticipation.comments.map((comment) => {
      return comment["_id"];
    });
    const replyIds = voteParticipation.comments
      .map((comment) => {
        return comment.replies.map((replyId) => {
          return replyId;
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
  }
}
