import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ClientSession } from "mongoose";
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
import { getCurrentISOTime } from "src/Util";

@Injectable()
export class MongoVoteCreateService {
  constructor(
    @InjectModel(Vote.name) private readonly Vote: Model<VoteDocument>,
    @InjectModel(VoteComment.name)
    private readonly VoteComment: Model<VoteCommentDocument>,
    @InjectModel(VoteParticipation.name)
    private readonly VoteParticipation: Model<VoteParticipationDocument>,
    @InjectModel(VoteReply.name)
    private readonly VoteReply: Model<VoteReplyDocument>,
  ) {}

  /**
   * @Transaction
   * 새로운 투표를 생성합니다.
   *
   * @param authorId 투표 업로더 _id
   * @param vote 투표 정보
   * @param session
   *
   * @return 생성된 투표 정보
   * @author 현웅
   */
  async createVote(
    authorId: string,
    vote: Partial<Vote>,
    session: ClientSession,
  ) {
    const newVotes = await this.Vote.create(
      [{ ...vote, authorId, result: Array(vote.options?.length).fill(0) }],
      { session },
    );

    const newVote = newVotes[0];
    // await this.VoteComment.create([{ _id: newVote._id }], { session });
    await this.VoteParticipation.create([{ _id: newVote._id }], { session });

    return newVote;
  }

  /**
   * @Transaction
   * 투표 댓글을 작성합니다.
   * @return 생성된 투표 댓글
   * @author 현웅
   */
  async createVoteComment(voteComment: VoteComment, session?: ClientSession) {
    await this.Vote.findByIdAndUpdate(
      voteComment.voteId,
      { $inc: { commentsNum: 1 } },
      { session },
    );
    const newComments = await this.VoteComment.create(
      [{ ...voteComment, createdAt: getCurrentISOTime() }],
      { session },
    );
    await this.VoteParticipation.findByIdAndUpdate(
      voteComment.voteId,
      { $push: { commentIds: newComments[0]._id } },
      { session },
    );
    return newComments[0];
  }

  /**
   * @Transaction
   * 투표 대댓글을 작성합니다.
   * @return 생성된 투표 대댓글
   * @author 현웅
   */
  async createVoteReply(voteReply: VoteReply, session?: ClientSession) {
    await this.Vote.findByIdAndUpdate(
      voteReply.voteId,
      { $inc: { commentsNum: 1 } },
      { session },
    );
    const newReplies = await this.VoteReply.create(
      [{ ...voteReply, createdAt: getCurrentISOTime() }],
      { session },
    );
    await this.VoteComment.findByIdAndUpdate(
      voteReply.commentId,
      { $push: { replyIds: newReplies[0]._id } },
      { session },
    );
    return newReplies[0];
  }
}
