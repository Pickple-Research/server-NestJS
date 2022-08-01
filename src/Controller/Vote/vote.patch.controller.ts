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
import { VoteScrap, VoteParticipation } from "src/Schema";
import { Public } from "src/Security/Metadata";
import { VoteParticipateBodyDto, VoteUpdateBodyDto } from "src/Dto";
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
  @Public()
  @Patch("view/:voteId")
  async viewVote(@Param() param: { voteId: string }) {
    return await this.mongoVoteUpdateService.updateView({
      voteId: param.voteId,
    });
  }

  /**
   * 투표를 스크랩합니다.
   * @return 업데이트된 투표 정보, 생성된 투표 스크랩 정보
   * @author 현웅
   */
  @Patch("scrap/:voteId")
  async scrapVote(
    @Request() req: { user: JwtUserInfo },
    @Param("voteId") voteId: string,
  ) {
    const voteScrap: VoteScrap = {
      userId: req.user.userId,
      voteId,
      createdAt: getCurrentISOTime(),
    };

    const { updatedVote, newVoteScrap } =
      await this.voteUpdateService.scrapVote({
        voteId,
        voteScrap,
      });
    return { updatedVote, newVoteScrap };
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
    const updatedVote = await this.voteUpdateService.unscrapVote({
      userId: req.user.userId,
      voteId: param.voteId,
    });
    return updatedVote;
  }

  /**
   * @Transaction
   * 투표에 참여합니다.
   * @return 업데이트된 투표 정보, 생성된 투표 참여 정보
   * @author 현웅
   */
  @Patch("participate/:voteId")
  async participateVote(
    @Request() req: { user: JwtUserInfo },
    @Param("voteId") voteId: string,
    @Body() body: VoteParticipateBodyDto,
  ) {
    //* 투표 참여 정보
    const voteParticipation: VoteParticipation = {
      userId: req.user.userId,
      voteId,
      selectedOptionIndexes: body.selectedOptionIndexes,
      createdAt: getCurrentISOTime(),
    };

    const voteSession = await this.voteConnection.startSession();

    return await tryMultiTransaction(async () => {
      const { updatedVote, newVoteParticipation } =
        await this.voteUpdateService.participateVote(
          { voteId, voteParticipation },
          voteSession,
        );
      return { updatedVote, newVoteParticipation };
    }, [voteSession]);
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

  /**
   * @Transaction
   * 투표 콘텐츠를 수정합니다.
   * 수정할 수 있는 범위는 제목과 내용으로 제한되며,
   * 수정을 요청한 유저가 투표 작성자가 아닌 경우 에러를 일으킵니다.
   * @return 수정된 투표 정보
   * @author 현웅
   */
  @Patch(":voteId")
  async updateVote(
    @Request() req: { user: JwtUserInfo },
    @Param("voteId") voteId: string,
    @Body() body: VoteUpdateBodyDto,
  ) {
    const voteSession = await this.voteConnection.startSession();

    return await this.voteUpdateService.updateVote(
      { userId: req.user.userId, voteId, vote: body },
      voteSession,
    );
  }
}
