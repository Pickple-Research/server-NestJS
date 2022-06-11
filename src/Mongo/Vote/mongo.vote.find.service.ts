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
} from "src/Schema";
import {
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
  ) {}

  async getVoteById(voteId: string) {
    const vote = await this.Vote.findById(voteId).lean();
    const voteParticipation = await this.VoteParticipation.findById(voteId)
      .select({
        viewedNum: 1,
        scrappedNum: 1,
        participantNum: 1,
      })
      .lean();
    return await Promise.all([vote, voteParticipation]);
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
