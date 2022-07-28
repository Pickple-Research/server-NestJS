import { Controller, Request, Param, Headers, Delete } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { VoteDeleteService } from "src/Service";
import { JwtUserInfo } from "src/Object/Type";
import { tryMultiTransaction } from "src/Util";
import { MONGODB_VOTE_CONNECTION } from "src/Constant";

@Controller("votes")
export class VoteDeleteController {
  constructor(
    private readonly voteDeleteService: VoteDeleteService,

    @InjectConnection(MONGODB_VOTE_CONNECTION)
    private readonly voteConnection: Connection,
  ) {}

  /**
   * !caution: 서버에서 header 데이터를 못 받습니다
   * 투표를 삭제합니다.
   * @author 현웅
   */
  @Delete("")
  async deleteVote(
    @Request() req: { user: JwtUserInfo },
    @Headers("vote_id") voteId: string,
  ) {
    const voteSession = await this.voteConnection.startSession();
    await tryMultiTransaction(async () => {
      await this.voteDeleteService.deleteVote(
        { userId: req.user.userId, voteId },
        voteSession,
      );
    }, [voteSession]);
    return;
  }

  /**
   * 투표를 삭제합니다.
   * @author 현웅
   */
  @Delete(":voteId")
  async deleteVoteWithParam(
    @Request() req: { user: JwtUserInfo },
    @Param() param: { voteId: string },
  ) {
    const voteSession = await this.voteConnection.startSession();
    await tryMultiTransaction(async () => {
      await this.voteDeleteService.deleteVote(
        { userId: req.user.userId, voteId: param.voteId },
        voteSession,
      );
    }, [voteSession]);
    return;
  }
}
