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
  VoteReport,
  VoteReportDocument,
  VoteUser,
  VoteUserDocument,
  User,
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
    @InjectModel(VoteReport.name)
    private readonly VoteReport: Model<VoteReportDocument>,
    @InjectModel(VoteUser.name)
    private readonly VoteUser: Model<VoteUserDocument>,
  ) {}

  /**
   * @Transaction
   * 유저가 생성될 때, VoteUser도 함께 만듭니다.
   * 투표 작성자, 투표 (대)댓글 작성자 정보를 populate 해서 가져올 때 사용하게 됩니다.
   * @author 현웅
   */
  async createVoteUser(param: { user: User }, session: ClientSession) {}

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
    await this.VoteParticipation.create([{ _id: newVote._id }], { session });

    return newVote;
  }

  /**
   * @Transaction
   * 투표 댓글을 작성합니다.
   * @return 업데이트 된 투표 정보와 생성된 투표 댓글
   * @author 현웅
   */
  async createVoteComment(voteComment: VoteComment, session?: ClientSession) {
    const updatedVote = await this.Vote.findByIdAndUpdate(
      voteComment.voteId,
      { $inc: { commentsNum: 1 } },
      { session, returnOriginal: false },
    ).lean();
    const newComments = await this.VoteComment.create(
      [{ ...voteComment, createdAt: getCurrentISOTime() }],
      { session },
    );
    await this.VoteParticipation.findByIdAndUpdate(
      voteComment.voteId,
      { $push: { comments: newComments[0]._id } },
      { session },
    );

    return { updatedVote, newComment: newComments[0].toObject() };
  }

  /**
   * @Transaction
   * 투표 대댓글을 작성합니다.
   * @return 업데이트 된 투표 정보와 생성된 투표 대댓글
   * @author 현웅
   */
  async createVoteReply(voteReply: VoteReply, session?: ClientSession) {
    const updatedVote = await this.Vote.findByIdAndUpdate(
      voteReply.voteId,
      { $inc: { commentsNum: 1 } },
      { session, returnOriginal: false },
    ).lean();
    const newReplies = await this.VoteReply.create(
      [{ ...voteReply, createdAt: getCurrentISOTime() }],
      { session },
    );
    await this.VoteComment.findByIdAndUpdate(
      voteReply.commentId,
      { $push: { replies: newReplies[0]._id } },
      { session },
    );
    return { updatedVote, newReply: newReplies[0].toObject() };
  }

  /**
   * 투표 신고 정보를 생성합니다.
   * @author 현웅
   */
  async createVoteReport(param: {
    userId: string;
    userNickname: string;
    voteId: string;
    content: string;
  }) {
    const vote = await this.Vote.findById(param.voteId)
      .select({
        title: 1,
      })
      .lean();

    await this.VoteReport.create([
      {
        userId: param.userId,
        userNickname: param.userNickname,
        voteId: param.voteId,
        voteTitle: vote.title,
        content: param.content,
      },
    ]);

    return;
  }
}
