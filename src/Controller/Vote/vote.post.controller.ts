import { Controller, Inject, Request, Body, Post } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { MongoUserUpdateService, MongoVoteCreateService } from "src/Mongo";
import { VoteCreateBodyDto } from "src/Dto";
import { JwtUserInfo } from "src/Object/Type";
import { tryTransaction } from "src/Util";
import { MONGODB_USER_CONNECTION, MONGODB_VOTE_CONNECTION } from "src/Constant";

@Controller("votes")
export class VotePostController {
  constructor(
    @InjectConnection(MONGODB_USER_CONNECTION)
    private readonly userConnection: Connection,
    @InjectConnection(MONGODB_VOTE_CONNECTION)
    private readonly voteConnection: Connection,
  ) {}

  @Inject()
  private readonly mongoUserUpdateService: MongoUserUpdateService;
  @Inject()
  private readonly mongoVoteCreateService: MongoVoteCreateService;

  /**
   * @Transaction
   * 새로운 투표를 업로드합니다.
   * 먼저 투표를 생성하고, 해당 투표 _id를 유저 활동 정보에 추가합니다.
   * @author 현웅
   */
  @Post("")
  async uploadVote(
    @Request() req: { user: JwtUserInfo },
    @Body() voteCreateBodyDto: VoteCreateBodyDto,
  ) {
    const voteSession = await this.voteConnection.startSession();

    await tryTransaction(async () => {
      const newVoteId = await this.mongoVoteCreateService.createVote(
        // req.user.userId,
        "62872828ce447005a0be3dbc",
        voteCreateBodyDto,
        voteSession,
      );

      return await this.mongoUserUpdateService.uploadVote(
        // req.user.userId,
        "62872828ce447005a0be3dbc",
        newVoteId,
      );
    }, voteSession);

    return true;
  }
}
