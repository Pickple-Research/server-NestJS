import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ClientSession } from "mongoose";
import {
  Vote,
  VoteDocument,
  VoteComment,
  VoteCommentDocument,
  VoteCommentReport,
  VoteCommentReportDocument,
  VoteParticipation,
  VoteParticipationDocument,
  VoteReply,
  VoteReplyDocument,
  VoteReport,
  VoteReportDocument,
  VoteScrap,
  VoteScrapDocument,
  VoteUser,
  VoteUserDocument,
  VoteView,
  VoteViewDocument,
} from "src/Schema";
import { getCurrentISOTime } from "src/Util";
import { VoteNotFoundException } from "src/Exception";

@Injectable()
export class MongoVoteCreateService {
  constructor(
    @InjectModel(Vote.name) private readonly Vote: Model<VoteDocument>,
    @InjectModel(VoteComment.name)
    private readonly VoteComment: Model<VoteCommentDocument>,
    @InjectModel(VoteCommentReport.name)
    private readonly VoteCommentReport: Model<VoteCommentReportDocument>,
    @InjectModel(VoteParticipation.name)
    private readonly VoteParticipation: Model<VoteParticipationDocument>,
    @InjectModel(VoteReply.name)
    private readonly VoteReply: Model<VoteReplyDocument>,
    @InjectModel(VoteReport.name)
    private readonly VoteReport: Model<VoteReportDocument>,
    @InjectModel(VoteScrap.name)
    private readonly VoteScrap: Model<VoteScrapDocument>,
    @InjectModel(VoteUser.name)
    private readonly VoteUser: Model<VoteUserDocument>,
    @InjectModel(VoteView.name)
    private readonly VoteView: Model<VoteViewDocument>,
  ) {}

  /**
   * @Transaction
   * 유저가 생성될 때, VoteUser도 함께 만듭니다.
   * 투표 작성자, 투표 (대)댓글 작성자 정보를 populate 해서 가져올 때 사용하게 됩니다.
   * @author 현웅
   */
  async createVoteUser(param: { user: VoteUser }, session: ClientSession) {
    await this.VoteUser.create([param.user], { session });
    return;
  }

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
  async createVote(param: { vote: Vote }, session: ClientSession) {
    const newVotes = await this.Vote.create(
      [{ ...param.vote, author: param.vote.authorId }],
      { session },
    );

    const newVote = await newVotes[0].populate({
      path: "author",
      model: this.VoteUser,
    });

    // return newVote.toObject();

    //! 그린라이트 투표는 게시자를 익명으로 바꿔서 반환합니다.
    if (newVote.category !== "GREEN_LIGHT") return newVote;
    return { ...newVote, author: { ...newVote.author, nickname: "익명" } };
  }

  /**
   * 새로운 투표 조회시: 투표 조회 정보를 생성합니다.
   * @return 생성된 투표 조회 정보
   * @author 현웅
   */
  async createVoteView(param: { voteView: VoteView }) {
    const newVoteView = await this.VoteView.create([param.voteView]);
    return newVoteView[0].toObject();
  }

  /**
   * 투표 스크랩시: 투표 스크랩 정보를 생성합니다.
   * @return 생성된 투표 스크랩 정보
   * @author 현웅
   */
  async createVoteScrap(param: { voteScrap: VoteScrap }) {
    const newVoteScrapes = await this.VoteScrap.create([param.voteScrap]);
    return newVoteScrapes[0].toObject();
  }

  /**
   * 투표 참여시: 투표 참여 정보를 만듭니다.
   * @return 생성된 투표 참여 정보
   * @author 현웅
   */
  async createVoteParticipation(
    param: {
      voteParticipation: VoteParticipation;
    },
    session: ClientSession,
  ) {
    const newVoteParticipations = await this.VoteParticipation.create(
      [param.voteParticipation],
      { session },
    );
    return newVoteParticipations[0].toObject();
  }

  /**
   * @Transaction
   * 투표 댓글을 작성합니다.
   * @return 업데이트 된 투표 정보와 생성된 투표 댓글
   * @author 현웅
   */
  async createVoteComment(
    param: { comment: VoteComment },
    session?: ClientSession,
  ) {
    const updatedVote = await this.Vote.findByIdAndUpdate(
      param.comment.voteId,
      { $inc: { commentsNum: 1 } },
      { session, returnOriginal: false },
    )
      .populate({
        path: "author",
        model: this.VoteUser,
      })
      .lean();
    if (!updatedVote) throw new VoteNotFoundException();

    const newComments = await this.VoteComment.create(
      [
        {
          ...param.comment,
          author: param.comment.authorId,
        },
      ],
      { session },
    );

    const newComment = await newComments[0].populate({
      path: "author",
      model: this.VoteUser,
    });

    // return { updatedVote, newComment: newComment.toObject() };
    //! 그린라이트 투표는 게시자를 익명으로 바꿔서 반환합니다.
    if (updatedVote.category !== "GREEN_LIGHT")
      return { updatedVote, newComment: newComment.toObject() };
    const newCommentObject = newComment.toObject();
    return {
      updatedVote: {
        ...updatedVote,
        author: { ...updatedVote.author, nickname: "익명" },
      },
      newComment: {
        ...newCommentObject,
        author: { ...newCommentObject.author, nickname: "익명" },
      },
    };
  }

  /**
   * @Transaction
   * 투표 대댓글을 작성합니다.
   * @return 업데이트 된 투표 정보와 생성된 투표 대댓글
   * @author 현웅
   */
  async createVoteReply(param: { reply: VoteReply }, session?: ClientSession) {
    const updatedVote = await this.Vote.findByIdAndUpdate(
      param.reply.voteId,
      { $inc: { commentsNum: 1 } },
      { session, returnOriginal: false },
    )
      .populate({
        path: "author",
        model: this.VoteUser,
      })
      .lean();
    if (!updatedVote) throw new VoteNotFoundException();

    const newReplies = await this.VoteReply.create(
      [
        {
          ...param.reply,
          author: param.reply.authorId,
        },
      ],
      { session },
    );
    await this.VoteComment.findByIdAndUpdate(
      param.reply.commentId,
      { $push: { replies: newReplies[0]._id } },
      { session },
    );

    const newReply = await newReplies[0].populate({
      path: "author",
      model: this.VoteUser,
    });

    // return { updatedVote, newReply: newReply.toObject() };
    //! 그린라이트 투표는 게시자를 익명으로 바꿔서 반환합니다.
    if (updatedVote.category !== "GREEN_LIGHT")
      return { updatedVote, newReply: newReply.toObject() };
    const newReplyObject = newReply.toObject();
    return {
      updatedVote: {
        ...updatedVote,
        author: { ...updatedVote.author, nickname: "익명" },
      },
      newReply: {
        ...newReplyObject,
        author: { ...newReplyObject.author, nickname: "익명" },
      },
    };
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
        createdAt: getCurrentISOTime(),
      },
    ]);

    return;
  }

  /**
   * 투표 (대)댓글 신고 정보를 생성합니다.
   * @author 현웅
   */
  async createVoteCommentReport(param: {
    voteCommentReport: VoteCommentReport;
  }) {
    await this.VoteCommentReport.create([param.voteCommentReport]);
  }
}
