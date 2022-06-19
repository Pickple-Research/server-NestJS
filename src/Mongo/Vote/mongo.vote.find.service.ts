import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
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
import {
  NotVoteAuthorException,
  SelectedOptionInvalidException,
  VoteNotFoundException,
} from "src/Exception";

@Injectable()
export class MongoVoteFindService {
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
   * 인자로 받은 유저 _id 가 투표 작성자 _id 와 일치하는지 확인합니다.
   * 일치하지 않는 경우, 에러를 발생시킵니다.
   * @author 현웅
   */
  async isVoteAuthor(param: { userId: string; voteId: string }) {
    const vote = await this.Vote.findById(param.voteId)
      .select({ authorId: 1 })
      .lean();
    if (vote.authorId !== param.userId) {
      throw new NotVoteAuthorException();
    }
    return;
  }

  async getVoteById(voteId: string) {
    return await this.Vote.findById(voteId).lean();
  }

  async getVotes() {
    return await this.Vote.find().sort({ _id: -1 }).lean();
  }

  /**
   * 투표 댓글을 모두 가져옵니다.
   * 이 때, 댓글의 'replyIds' 이름을 'replies' 로 변환한 후 반환합니다.
   * @author 현웅
   */
  async getVoteComments(voteId: string) {
    const voteParticipation = await this.VoteParticipation.findById(voteId)
      .select({ commentIds: 1 })
      .populate({
        path: "commentIds",
        model: this.VoteComment,
        populate: {
          path: "replyIds",
          model: this.VoteReply,
        },
      })
      .lean();

    //* 곧바로 반환하지 말고, 'replyIds' 를 'replies' 로 변환하여 반환합니다.
    //* (로컬에서 쓰이는 key 이름과 맞춰주기 위함입니다)
    return voteParticipation.commentIds.map((comment) => {
      comment[`replies`] = comment[`replyIds`];
      delete comment["replyIds"];
      return comment;
    });
  }

  /**
   * 투표에 참여할 때, 전달된 선택지 index가 유효한 범위 내에 있는지 확인합니다.
   * @author 현웅
   */
  async isOptionIndexesValid(voteId: string, selectedOptionIndexes: number[]) {
    const vote = await this.Vote.findById(voteId).select({ options: 1 }).lean();

    if (!vote) {
      throw new VoteNotFoundException();
    }

    if (Math.max(...selectedOptionIndexes) >= vote.options.length) {
      throw new SelectedOptionInvalidException();
    }

    return;
  }
}
