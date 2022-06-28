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
import { UserUpdateService, VoteUpdateService } from "src/Service";
import { MongoUserUpdateService, MongoVoteUpdateService } from "src/Mongo";
import { ParticipatedVoteInfo } from "src/Schema/User/Embedded";
import { VoteParticipantInfo } from "src/Schema/Vote/Embedded";
import { VoteParticipateBodyDto } from "src/Dto";
import { JwtUserInfo } from "src/Object/Type";
import { getCurrentISOTime, tryMultiTransaction } from "src/Util";
import { MONGODB_USER_CONNECTION, MONGODB_VOTE_CONNECTION } from "src/Constant";

@Controller("votes")
export class VotePatchController {
  constructor(
    private readonly userUpdateService: UserUpdateService,
    private readonly voteUpdateService: VoteUpdateService,

    @InjectConnection(MONGODB_USER_CONNECTION)
    private readonly userConnection: Connection,
    @InjectConnection(MONGODB_VOTE_CONNECTION)
    private readonly voteConnection: Connection,
  ) {}

  @Inject()
  private readonly mongoUserUpdateService: MongoUserUpdateService;
  @Inject()
  private readonly mongoVoteUpdateService: MongoVoteUpdateService;

  /**
   * 투표를 조회합니다.
   * @author 현웅
   */
  @Patch("view/:voteId")
  async viewVote(
    @Request() req: { user: JwtUserInfo },
    @Param() param: { voteId: string },
  ) {
    const updateUser = this.mongoUserUpdateService.viewVote({
      userId: req.user.userId,
      voteId: param.voteId,
    });
    const updateVote = this.mongoVoteUpdateService.updateView({
      userId: req.user.userId,
      voteId: param.voteId,
    });
    await Promise.all([updateUser, updateVote]);
    return;
  }

  /**
   * 투표를 스크랩합니다.
   * @return 업데이트된 투표 정보
   * @author 현웅
   */
  @Patch("scrap/:voteId")
  async scrapVote(
    @Request() req: { user: JwtUserInfo },
    @Param() param: { voteId: string },
  ) {
    const updateUser = this.mongoUserUpdateService.scrapVote({
      userId: req.user.userId,
      voteId: param.voteId,
    });
    const updateVote = this.mongoVoteUpdateService.updateScrap({
      userId: req.user.userId,
      voteId: param.voteId,
    });

    const updatedVote = await Promise.all([updateUser, updateVote]).then(
      ([_, updatedVote]) => {
        return updatedVote;
      },
    );
    return updatedVote;
  }

  /**
   * 투표 스크랩을 취소합니다.
   * @return 업데이트된 투표 정보
   * @author 현웅
   */
  @Patch("unscrap/:voteId")
  async unscrapVote(
    @Request() req: { user: JwtUserInfo },
    @Param() param: { voteId: string },
  ) {
    const updateUser = this.mongoUserUpdateService.unscrapVote({
      userId: req.user.userId,
      voteId: param.voteId,
    });
    const updateVote = this.mongoVoteUpdateService.updateUnscrap({
      userId: req.user.userId,
      voteId: param.voteId,
    });

    const updatedVote = await Promise.all([updateUser, updateVote]).then(
      ([_, updatedVote]) => {
        return updatedVote;
      },
    );
    return updatedVote;
  }

  /**
   * @Transaction
   * 투표에 참여합니다.
   * @return 투표 참여 정보, 업데이트된 투표 정보
   * @author 현웅
   */
  @Patch("participate/:voteId")
  async participateVote(
    @Request() req: { user: JwtUserInfo },
    @Param("voteId") voteId: string,
    @Body() body: VoteParticipateBodyDto,
  ) {
    const startUserSession = this.userConnection.startSession();
    const startVoteSession = this.voteConnection.startSession();

    const { userSession, voteSession } = await Promise.all([
      startUserSession,
      startVoteSession,
    ]).then(([userSession, voteSession]) => {
      return { userSession, voteSession };
    });

    const currentTime = getCurrentISOTime();

    //* 유저의 투표 참여 정보
    const participatedVoteInfo: ParticipatedVoteInfo = {
      voteId,
      selectedOptionIndexes: body.selectedOptionIndexes,
      participatedAt: currentTime,
    };

    //* 투표의 참여 정보
    const voteParticipantInfo: VoteParticipantInfo = {
      userId: req.user.userId,
      selectedOptionIndexes: body.selectedOptionIndexes,
      participatedAt: currentTime,
    };

    return await tryMultiTransaction(async () => {
      const updateUser = this.userUpdateService.participateVote(
        {
          userId: req.user.userId,
          voteId,
          participatedVoteInfo,
        },
        userSession,
      );

      const updateVote = this.voteUpdateService.updateParticipant(
        { voteId, voteParticipantInfo },
        voteSession,
      );

      //* 위 두 개의 함수를 한꺼번에 실행.
      const updatedVote = await Promise.all([updateUser, updateVote]).then(
        ([_, updatedVote]) => {
          //* 이 때, 업데이트 된 투표 정보는 따로 빼서 반환해줍니다.
          //* (로컬에서 재활용합니다)
          return updatedVote;
        },
      );

      return { participatedVoteInfo, updatedVote };
    }, [userSession, voteSession]);
  }

  /**
   * @Transaction
   * 투표를 마감합니다.
   * @return 마감된 투표 정보
   * @author 현웅
   */
  @Patch("close/:voteId")
  async closeVote(
    @Request() req: { user: JwtUserInfo },
    @Param("voteId") voteId: string,
  ) {
    const voteSession = await this.voteConnection.startSession();

    return await tryMultiTransaction(async () => {
      const updatedVote = await this.voteUpdateService.closeVote(
        { userId: req.user.userId, voteId },
        voteSession,
      );
      return updatedVote;
    }, [voteSession]);
  }
}
