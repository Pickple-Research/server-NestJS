import { Injectable, Inject } from "@nestjs/common";
import { ClientSession } from "mongoose";
import { MongoVoteFindService, MongoVoteUpdateService } from "src/Mongo";
import { VoteParticipantInfo } from "src/Schema";

@Injectable()
export class VoteUpdateService {
  constructor() {}

  @Inject()
  private readonly mongoVoteFindService: MongoVoteFindService;
  @Inject()
  private readonly mongoVoteUpdateService: MongoVoteUpdateService;

  /**
   * @Transaction
   * 참여한 유저 정보를 추가합니다.
   * 참여 정보가 유효한지 (선택지 인덱스가 유효한지) 확인하고,
   * 그렇지 않은 경우 에러를 일으킵니다.
   * @return 참여 정보가 반영된 최신 투표 정보
   * @author 현웅
   */
  async updateParticipant(
    param: { voteId: string; voteParticipantInfo: VoteParticipantInfo },
    session: ClientSession,
  ) {
    //* 선택지 index가 유효한 범위 내에 있는지 확인
    const checkIndexesValid = this.mongoVoteFindService.isOptionIndexesValid(
      param.voteId,
      param.voteParticipantInfo.selectedOptionIndexes,
    );
    //* 투표 참여자 정보를 VoteParticipation 에 추가하고
    //* 참여자 수를 1 증가시킵니다.
    const updateParticipant = this.mongoVoteUpdateService.updateParticipant(
      { voteId: param.voteId, participantInfo: param.voteParticipantInfo },
      session,
    );

    const updatedVote = await Promise.all([
      checkIndexesValid,
      updateParticipant,
    ]).then(([_, updatedVote]) => {
      return updatedVote;
    });
    return updatedVote;
  }

  /**
   * @Transaction
   * 투표를 마감합니다.
   * 이 때, 투표 마감을 요청한 유저가 투표 작성자가 아닌 경우 에러를 일으킵니다.
   * @return 마감된 투표 정보
   * @author 현웅
   */
  async closeVote(
    param: { userId: string; voteId: string },
    session: ClientSession,
  ) {
    const checkIsAuthor = this.mongoVoteFindService.isVoteAuthor({
      userId: param.userId,
      voteId: param.voteId,
    });
    //* 투표를 마감합니다.
    const closeVote = this.mongoVoteUpdateService.closeVote(
      { voteId: param.voteId },
      session,
    );

    const updatedVote = await Promise.all([checkIsAuthor, closeVote]).then(
      ([_, updatedVote]) => {
        return updatedVote;
      },
    );
    return updatedVote;
  }
}
