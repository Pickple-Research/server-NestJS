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
import { ParticipatedVoteInfo } from "src/Schema/User/Embedded";
import { VoteParticipantInfo } from "src/Schema/Vote/Embedded";
import { VoteParticipateBodyDto } from "src/Dto";
import { JwtUserInfo } from "src/Object/Type";
import {
  getCurrentISOTime,
  tryTransaction,
  tryMultiTransaction,
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
   * 투표를 조회합니다.
   * @author 현웅
   */
  @Patch("view/:voteId")
  async viewVote(
    @Request() req: { user: JwtUserInfo },
    @Param() param: { voteId: string },
  ) {
    const updateUser = await this.mongoUserUpdateService.viewVote(
      req.user.userId,
      param.voteId,
    );
    const updateVote = await this.mongoVoteUpdateService.updateView(
      req.user.userId,
      param.voteId,
    );
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
    const updateUser = await this.mongoUserUpdateService.scrapVote(
      req.user.userId,
      param.voteId,
    );
    const updateVote = await this.mongoVoteUpdateService.updateScrap(
      req.user.userId,
      param.voteId,
    );

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
    const updateUser = await this.mongoUserUpdateService.unscrapVote(
      req.user.userId,
      param.voteId,
    );
    const updateVote = await this.mongoVoteUpdateService.updateUnscrap(
      req.user.userId,
      param.voteId,
    );

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
    const currentISOTime = getCurrentISOTime();
    const userSession = await this.userConnection.startSession();
    const voteSession = await this.voteConnection.startSession();

    return await tryMultiTransaction(async () => {
      //* 선택지 index가 유효한 범위 내에 있는지 확인
      const checkIndexesValid =
        await this.mongoVoteFindService.isOptionIndexesValid(
          voteId,
          body.selectedOptionIndexes,
        );

      //* 유저가 이미 투표에 참여했는지 확인
      const checkAlreadyParticipated =
        await this.mongoUserFindService.didUserParticipatedVote(
          req.user.userId,
          voteId,
          true,
        );

      //* 유저의 투표 참여 정보를 업데이트
      const participatedVoteInfo: ParticipatedVoteInfo = {
        voteId,
        selectedOptionIndexes: body.selectedOptionIndexes,
        participatedAt: currentISOTime,
      };

      const updateUser = await this.mongoUserUpdateService.participateVote(
        req.user.userId,
        participatedVoteInfo,
        userSession,
      );

      //* 투표의 참여 정보를 업데이트
      const voteParticipantInfo: VoteParticipantInfo = {
        userId: req.user.userId,
        selectedOptionIndexes: body.selectedOptionIndexes,
        participatedAt: currentISOTime,
      };

      const updateVote = await this.mongoVoteUpdateService.updateParticipant(
        voteId,
        voteParticipantInfo,
        voteSession,
      );

      //* 위 네 개의 함수를 한꺼번에 실행.
      //* 넷 중 하나라도 에러가 발생하면 모든 변경사항이 취소됨.
      const updatedVote = await Promise.all([
        checkIndexesValid,
        checkAlreadyParticipated,
        updateUser,
        updateVote,
      ]).then(([_, __, ___, updatedVote]) => {
        //* 이 때, 업데이트 된 투표 정보는 따로 빼서 반환해줍니다.
        //* (로컬에서 재활용합니다)
        return updatedVote;
      });

      return { participatedVoteInfo, updatedVote };
    }, [userSession, voteSession]);
  }

  /**
   * @Transaction
   * 투표를 마감합니다.
   * @return 업데이트된 투표 정보
   * @author 현웅
   */
  @Patch("close/:voteId")
  async closeVote(
    @Request() req: { user: JwtUserInfo },
    @Param("voteId") voteId: string,
  ) {
    const voteSession = await this.voteConnection.startSession();

    return await tryTransaction(async () => {
      //* 투표 마감을 요청한 유저가 투표 작성자인지 여부를 확인합니다.
      const checkIsAuthor = await this.mongoVoteFindService.isVoteAuthor({
        userId: req.user.userId,
        voteId,
      });
      //* 투표를 마감합니다.
      const closeVote = await this.mongoVoteUpdateService.closeVote(voteId);

      const updatedVote = await Promise.all([checkIsAuthor, closeVote]).then(
        ([_, updatedVote]) => {
          return updatedVote;
        },
      );
      return updatedVote;
    }, voteSession);
  }
}
