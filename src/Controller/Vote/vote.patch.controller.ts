import {
  Controller,
  Inject,
  Request,
  Body,
  Patch,
  Param,
} from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import {
  MongoUserFindService,
  MongoUserUpdateService,
  MongoVoteFindService,
  MongoVoteUpdateService,
} from "src/Mongo";
import { VoteParticipateBodyDto } from "src/Dto";
import { JwtUserInfo } from "src/Object/Type";
import {
  getCurrentISOTime,
  tryMultiTransaction,
  tryTransaction,
} from "src/Util";
import { MONGODB_USER_CONNECTION, MONGODB_VOTE_CONNECTION } from "src/Constant";

@Controller("votes")
export class VotePatchController {
  constructor(
    @InjectConnection(MONGODB_USER_CONNECTION)
    private readonly userConnection: Connection,
    @InjectConnection(MONGODB_VOTE_CONNECTION)
    private readonly voteConnection: Connection,
  ) {}

  @Inject()
  private readonly mongoUserFindService: MongoUserFindService;
  @Inject()
  private readonly mongoUserUpdateService: MongoUserUpdateService;
  @Inject()
  private readonly mongoVoteFindService: MongoVoteFindService;
  @Inject()
  private readonly mongoVoteUpdateService: MongoVoteUpdateService;

  /**
   * @Transaction
   * 투표에 참여합니다.
   * @author 현웅
   */
  @Patch("participate/:voteId")
  async participateVote(
    @Request() req: { user: JwtUserInfo },
    @Param("voteId") voteId: string,
    @Body() voteParticipateBodyDto: VoteParticipateBodyDto,
  ) {
    const currentISOTime = getCurrentISOTime();
    const userSession = await this.userConnection.startSession();
    const voteSession = await this.voteConnection.startSession();

    return await tryMultiTransaction(async () => {
      //* 선택지 index가 유효한 범위 내에 있는지 확인
      const checkIndexesValid =
        await this.mongoVoteFindService.isOptionIndexesValid(
          voteId,
          voteParticipateBodyDto.selectedOptionIndexes,
        );

      //* 유저가 이미 투표에 참여했는지 확인
      const checkAlreadyParticipated =
        await this.mongoUserFindService.didUserParticipatedVote(
          // req.user.userId,
          "62872828ce447005a0be3dbc",
          voteId,
          true,
        );

      //* 유저의 투표 참여 정보를 업데이트
      const updateUser = await this.mongoUserUpdateService.participateVote(
        // req.user.userId,
        "62872828ce447005a0be3dbc",
        {
          voteId,
          selectedOptionIndexes: voteParticipateBodyDto.selectedOptionIndexes,
          participatedAt: currentISOTime,
        },
        userSession,
      );

      //* 투표의 참여 정보를 업데이트
      const updateVote = await this.mongoVoteUpdateService.updateParticipant(
        voteId,
        {
          // userId: req.user.userId,
          userId: "62872828ce447005a0be3dbc",
          selectedOptionIndexes: voteParticipateBodyDto.selectedOptionIndexes,
          participatedAt: currentISOTime,
        },
        voteSession,
      );

      //* 위 네 개의 함수를 한꺼번에 실행.
      //* 넷 중 하나라도 에러가 발생하면 모든 변경사항이 취소됨.
      await Promise.all([
        checkIndexesValid,
        checkAlreadyParticipated,
        updateUser,
        updateVote,
      ]);
      return;
    }, [userSession, voteSession]);
  }
}
