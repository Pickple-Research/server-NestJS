import { Injectable } from "@nestjs/common";
import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { Model, Connection } from "mongoose";
import { Vote, VoteDocument } from "src/Schema";
import { MONGODB_VOTE_CONNECTION } from "src/Constant";

@Injectable()
export class MongoVoteDeleteService {
  constructor(
    @InjectModel(Vote.name) private readonly Vote: Model<VoteDocument>,

    @InjectConnection(MONGODB_VOTE_CONNECTION)
    private readonly connection: Connection,
  ) {}

  /**
   * 투표를 삭제합니다.
   * @author 현웅
   */
  async deleteVote(voteId: string) {}
}
