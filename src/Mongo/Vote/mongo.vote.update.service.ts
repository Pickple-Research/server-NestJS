import { Injectable } from "@nestjs/common";
import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { Model, Connection, ClientSession } from "mongoose";
import {
  Vote,
  VoteDocument,
  VoteParticipation,
  VoteParticipationDocument,
} from "src/Schema";
import { MONGODB_VOTE_CONNECTION } from "src/Constant";
import { VoteParticipantInfo } from "src/Schema/Vote/Embedded";

@Injectable()
export class MongoVoteUpdateService {
  constructor(
    @InjectModel(Vote.name) private readonly Vote: Model<VoteDocument>,
    @InjectModel(VoteParticipation.name)
    private readonly VoteParticipation: Model<VoteParticipationDocument>,

    @InjectConnection(MONGODB_VOTE_CONNECTION)
    private readonly connection: Connection,
  ) {}

  /**
   * 투표에 참여한 유저 정보를 추가하고 결과값을 증가시킵니다.
   *
   * @see https://stackoverflow.com/questions/21035603/mongo-node-syntax-for-inc-when-number-is-associated-with-dynamic-field-name
   * @author 현웅
   */
  async updateParticipant(
    voteId: string,
    participantInfo: VoteParticipantInfo,
    session?: ClientSession,
  ) {
    //* $inc 쿼리가 동적으로 생성되어야 하므로, 쿼리문 상수를 만듭니다
    const incQuery = {};
    //* result의 어떤 부분을 증가시킬지 설정합니다. 결과적으로 다음과 같은 쿼리를 실행시키는 것과 같은 결과를 도출합니다:
    /**
     * { $inc: { result.0: 1, result.1: 1 ... }}
     */
    participantInfo.selectedOptionIndexes.forEach((optionIndex) => {
      incQuery[`result.${optionIndex}`] = 1;
    });

    await this.Vote.findByIdAndUpdate(
      voteId,
      { $inc: { participantsNum: 1, ...incQuery } },
      { session },
    );

    await this.VoteParticipation.findByIdAndUpdate(
      voteId,
      {
        $addToSet: { participantInfos: participantInfo },
      },
      { session },
    );
  }
}
