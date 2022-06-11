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
} from "src/Schema";

@Injectable()
export class MongoVoteCreateService {
  constructor(
    @InjectModel(Vote.name) private readonly Vote: Model<VoteDocument>,
    @InjectModel(VoteComment.name)
    private readonly VoteComment: Model<VoteCommentDocument>,
    @InjectModel(VoteParticipation.name)
    private readonly VoteParticipation: Model<VoteParticipationDocument>,
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
    const newVotes = await this.Vote.create([{ ...vote, authorId }], {
      session,
    });

    const newVote = newVotes[0];
    // await this.VoteComment.create([{ _id: newVote._id }], { session });
    await this.VoteParticipation.create(
      [{ _id: newVote._id, result: Array(vote.options?.length).fill(0) }],
      { session },
    );

    return newVote;
  }
}
