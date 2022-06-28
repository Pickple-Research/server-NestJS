import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ClientSession } from "mongoose";
import {
  Vote,
  VoteDocument,
  VoteParticipation,
  VoteParticipationDocument,
  VoteUser,
  VoteUserDocument,
} from "src/Schema";
import { VoteParticipantInfo } from "src/Schema/Vote/Embedded";

@Injectable()
export class MongoVoteUpdateService {
  constructor(
    @InjectModel(Vote.name) private readonly Vote: Model<VoteDocument>,
    @InjectModel(VoteParticipation.name)
    private readonly VoteParticipation: Model<VoteParticipationDocument>,
    @InjectModel(VoteUser.name)
    private readonly VoteUser: Model<VoteUserDocument>,
  ) {}

  /**
   * 투표 조회자 정보를 추가합니다.
   * @author 현웅
   */
  async updateView(param: { userId: string; voteId: string }) {
    const updateVote = this.Vote.findByIdAndUpdate(param.voteId, {
      $inc: { viewsNum: 1 },
    });
    const updateParticipation = this.VoteParticipation.findByIdAndUpdate(
      param.voteId,
      { $addToSet: { viewedUserIds: param.userId } },
    );

    await Promise.all([updateVote, updateParticipation]);
    return;
  }

  /**
   * 스크랩 수를 1 늘리고 스크랩한 유저 _id를 참여 정보에 추가합니다.
   * @return 업데이트 된 투표 정보
   * @author 현웅
   */
  async updateScrap(param: { userId: string; voteId: string }) {
    const updateVote = this.Vote.findByIdAndUpdate(
      param.voteId,
      { $inc: { scrapsNum: 1 } },
      { returnOriginal: false },
    )
      .populate({
        path: "author",
        model: this.VoteUser,
      })
      .lean();
    const updateParticipation = this.VoteParticipation.findByIdAndUpdate(
      param.voteId,
      { $addToSet: { scrappedUserIds: param.userId } },
    );

    const updatedVote = await Promise.all([
      updateVote,
      updateParticipation,
    ]).then(([updatedVote, _]) => {
      return updatedVote;
    });
    return updatedVote;
  }

  /**
   * 스크랩 수를 1 줄이고 스크랩을 취소한 유저 _id를 참여 정보에서 제거합니다.
   * @return 업데이트 된 투표 정보
   * @author 현웅
   */
  async updateUnscrap(param: { userId: string; voteId: string }) {
    const updateVote = this.Vote.findByIdAndUpdate(
      param.voteId,
      { $inc: { scrapsNum: -1 } },
      { returnOriginal: false },
    )
      .populate({
        path: "author",
        model: this.VoteUser,
      })
      .lean();
    const updateParticipation = this.VoteParticipation.findByIdAndUpdate(
      param.voteId,
      { $pull: { scrappedUserIds: param.userId } },
    );

    const updatedVote = await Promise.all([
      updateVote,
      updateParticipation,
    ]).then(([updatedVote, _]) => {
      return updatedVote;
    });
    return updatedVote;
  }

  /**
   * 투표에 참여한 유저 정보를 추가하고 투표 참여자 값을 1 증가시킵니다.
   *
   * @see https://stackoverflow.com/questions/21035603/mongo-node-syntax-for-inc-when-number-is-associated-with-dynamic-field-name
   * @return 업데이트된 투표 정보
   * @author 현웅
   */
  async updateParticipant(
    param: { voteId: string; participantInfo: VoteParticipantInfo },
    session?: ClientSession,
  ) {
    //* $inc 쿼리가 동적으로 생성되어야 하므로, 쿼리문 상수를 만듭니다
    const incQuery = {};
    //* result의 어떤 부분을 증가시킬지 설정합니다. 결과적으로 다음과 같은 쿼리를 실행시키는 것과 같은 결과를 도출합니다:
    /**
     * { $inc: { result.0: 1, result.1: 1 ... }}
     */
    param.participantInfo.selectedOptionIndexes.forEach((optionIndex) => {
      incQuery[`result.${optionIndex}`] = 1;
    });

    const updatedVote = await this.Vote.findByIdAndUpdate(
      param.voteId,
      { $inc: { participantsNum: 1, ...incQuery } },
      { session, returnOriginal: false },
    )
      .populate({
        path: "author",
        model: this.VoteUser,
      })
      .lean();

    await this.VoteParticipation.findByIdAndUpdate(
      param.voteId,
      { $addToSet: { participantInfos: param.participantInfo } },
      { session },
    );

    return updatedVote;
  }

  /**
   * @Transaction
   * 투표를 마갑합니다.
   * @return 업데이트된 투표 정보
   * @author 현웅
   */
  async closeVote(param: { voteId: string }, session?: ClientSession) {
    return await this.Vote.findByIdAndUpdate(
      param.voteId,
      { $set: { closed: true } },
      { session, returnOriginal: false },
    )
      .populate({
        path: "author",
        model: this.VoteUser,
      })
      .lean();
  }
}
