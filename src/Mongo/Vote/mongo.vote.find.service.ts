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
  VoteUser,
  VoteUserDocument,
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
    @InjectModel(VoteUser.name)
    private readonly VoteUser: Model<VoteUserDocument>,
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
    return await this.Vote.findById(voteId)
      .populate({ path: "author", model: this.VoteUser })
      .lean();
  }

  /**
   * 최신 투표를 가져옵니다. 인자가 주어지지 않으면 20개를 가져옵니다.
   * @author 현웅
   */
  async getRecentVotes(limit: number = 20) {
    return await this.Vote.find()
      .sort({ _id: -1 })
      .limit(limit)
      .populate({
        path: "author",
        model: this.VoteUser,
      })
      .lean();
  }

  /**
   * 주어진 투표 _id을 기준으로 하여 더 최근의 투표를 모두 찾고 반환합니다.
   * @author 현웅
   */
  async getNewerVotes(voteId: string) {
    return await this.Vote.find({
      hidden: false, // 숨겼거나
      blocked: false, // 차단되지 않은 투표 중
      _id: { $gt: voteId }, // 주어진 voteId 보다 더 나중에 업로드된 투표 중에서
    })
      .sort({ _id: -1 }) // 최신순 정렬 후
      .populate({ path: "author", model: this.VoteUser })
      .lean(); // data만 뽑아서 반환
  }

  /**
   * 주어진 투표 _id을 기준으로 하여 과거의 투표 10개를 찾고 반환합니다.
   * @author 현웅
   */
  async getOlderVotes(voteId: string, limit: number = 10) {
    return await this.Vote.find({
      hidden: false, // 숨겼거나
      blocked: false, // 차단되지 않은 투표 중
      _id: { $lt: voteId }, // 주어진 voteId 보다 먼저 업로드된 투표 중에서
    })
      .sort({ _id: -1 }) // 최신순 정렬 후
      .limit(limit) // 10개를 가져오고
      .populate({ path: "author", model: this.VoteUser })
      .lean(); // data만 뽑아서 반환
  }

  /**
   * 투표 댓글을 모두 가져옵니다.
   * @author 현웅
   */
  async getVoteComments(voteId: string) {
    const voteParticipation = await this.VoteParticipation.findById(voteId)
      .select({ comments: 1 })
      .populate({
        path: "comments",
        model: this.VoteComment,
        populate: [
          {
            path: "author",
            model: this.VoteUser,
          },
          {
            path: "replies",
            model: this.VoteReply,
            populate: {
              path: "author",
              model: this.VoteUser,
            },
          },
        ],
      })
      .lean();

    return voteParticipation.comments;
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

  /**
   * 인자로 받은 voteIds 로 투표를 모두 찾고 반환합니다.
   * @author 현웅
   */
  async getVotes(voteIds: string[]) {
    return await this.Vote.find({ _id: { $in: voteIds } })
      .populate({ path: "author", model: this.VoteUser })
      .lean();
  }
}
