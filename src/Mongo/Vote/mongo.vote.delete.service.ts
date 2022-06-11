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
      //* 투표 기본 데이터는 삭제하지 않고 deleted만 수정한 채 남겨둡니다.
      await this.Vote.findByIdAndUpdate(
        voteId,
        { $set: { deleted: true } },
        { session },
      );
    }, session);
  }
}
