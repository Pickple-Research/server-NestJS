import { Controller, Inject, Request, Headers, Delete } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { VoteDeleteService } from "src/Service";
import { MongoUserUpdateService } from "src/Mongo";
import { JwtUserInfo } from "src/Object/Type";
import { tryMultiTransaction } from "src/Util";
import { MONGODB_USER_CONNECTION, MONGODB_VOTE_CONNECTION } from "src/Constant";

@Controller("votes")
export class VoteDeleteController {
  constructor(
    private readonly voteDeleteService: VoteDeleteService,

    @InjectConnection(MONGODB_USER_CONNECTION)
    private readonly userConnection: Connection,
    @InjectConnection(MONGODB_VOTE_CONNECTION)
    private readonly voteConnection: Connection,
  ) {}

  @Inject() private readonly mongoUserUpdateService: MongoUserUpdateService;

  @Delete("")
  async deleteVote(
    @Request() req: { user: JwtUserInfo },
    @Headers("vote_id") voteId: string,
  ) {
    const startUserSession = this.userConnection.startSession();
    const startVoteSession = this.voteConnection.startSession();

    const { userSession, voteSession } = await Promise.all([
      startUserSession,
      startVoteSession,
    ]).then(([userSession, voteSession]) => {
      return { userSession, voteSession };
    });

    await tryMultiTransaction(async () => {
      //* 유저 투표 정보 중 업로드한 투표 _id 를 제거합니다.
      const updateUserVote = this.mongoUserUpdateService.deleteUploadedVote(
        { userId: req.user.userId, voteId },
        userSession,
      );

      //* 투표와 관련된 모든 정보를 삭제합니다.
      const deleteVote = this.voteDeleteService.deleteVote(
        { userId: req.user.userId, voteId },
        voteSession,
      );

      //* 위 세 개 작업을 동시에 수행합니다.
      await Promise.all([updateUserVote, deleteVote]);
    }, [userSession, voteSession]);
    return;
  }
}
