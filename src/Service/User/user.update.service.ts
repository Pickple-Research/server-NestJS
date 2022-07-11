import { Injectable, Inject } from "@nestjs/common";
import { ClientSession } from "mongoose";
import {
  MongoUserFindService,
  MongoUserCreateService,
  MongoUserUpdateService,
} from "src/Mongo";
import {
  CreditHistory,
  ParticipatedResearchInfo,
  ParticipatedVoteInfo,
} from "src/Schema";

@Injectable()
export class UserUpdateService {
  constructor() {}

  @Inject() private readonly mongoUserFindService: MongoUserFindService;
  @Inject() private readonly mongoUserCreateService: MongoUserCreateService;
  @Inject() private readonly mongoUserUpdateService: MongoUserUpdateService;

  /**
   * @Transaction
   * 리서치에 참여합니다.
   * 유저가 이미 리서치에 참여했었는지 확인하고,
   * 참여하지 않았다면 리서치 참여정보를 UserResearch에 추가한 후
   * CreditHistory를 새로 만듭니다
   * @return 생성된 CreditHistory 정보
   * @author 현웅
   */
  async participateResearch(
    param: {
      userId: string;
      participatedResearchInfo: ParticipatedResearchInfo;
      creditHistory: CreditHistory;
    },
    session: ClientSession,
  ) {
    //* 유저가 이미 리서치에 참여했었는지 확인
    const checkAlreadyParticipated =
      this.mongoUserFindService.didUserParticipatedResearch({
        userId: param.userId,
        researchId: param.participatedResearchInfo.researchId,
      });
    //* UserResearch 에 리서치 참여 정보를 추가
    const updateUser = await this.mongoUserUpdateService.participateResearch(
      {
        userId: param.userId,
        participatedResearchInfo: param.participatedResearchInfo,
      },
      session,
    );

    await Promise.all([checkAlreadyParticipated, updateUser]);

    //* CreditHistory 를 생성하고 User 의 credit 에 반영한 후 해당 CreditHistory 반환
    return await this.mongoUserCreateService.createCreditHistory(
      {
        userId: param.userId,
        creditHistory: param.creditHistory,
      },
      session,
    );
  }

  /**
   * @Transaction
   * 리서치를 업로드합니다.
   * 유저가 리서치를 작성하기에 충분한 크레딧을 가지고 있는지 확인하고,
   * 충분하다면 생성된 researchId를 UserResearch에 추가한 후
   * CreditHistory를 새로 만듭니다
   * @author 현웅
   */
  async uploadResearch(
    param: { userId: string; researchId: string; creditHistory: CreditHistory },
    session: ClientSession,
  ) {
    //* 유저가 리서치를 업로드하기에 충분한 크레딧을 가지고 있는지 확인
    await this.mongoUserFindService.checkUserHasEnoughCredit({
      userId: param.userId,
      credit: -1 * param.creditHistory.scale,
    });

    //* CreditHistory 생성 및 User 의 credit 에 반영 후 해당 CreditHistory 반환
    return await this.mongoUserCreateService.createCreditHistory(
      { userId: param.userId, creditHistory: param.creditHistory },
      session,
    );
  }

  /**
   * @Transaction
   * 투표에 참여합니다.
   * 유저가 이미 투표에 참여했었는지 확인하고,
   * 참여하지 않았다면 투표 참여정보를 UserVote에 추가합니다.
   * @author 현웅
   */
  async participateVote(
    param: {
      userId: string;
      voteId: string;
      participatedVoteInfo: ParticipatedVoteInfo;
    },
    session: ClientSession,
  ) {
    //* 유저가 이미 투표에 참여했는지 확인
    const checkAlreadyParticipated =
      this.mongoUserFindService.didUserParticipatedVote({
        userId: param.userId,
        voteId: param.voteId,
      });
    //* UserVote 에 투표 참여 정보를 추가
    const updateUserVote = this.mongoUserUpdateService.participateVote(
      {
        userId: param.userId,
        participatedVoteInfo: param.participatedVoteInfo,
      },
      session,
    );
    await Promise.all([checkAlreadyParticipated, updateUserVote]);
  }
}
