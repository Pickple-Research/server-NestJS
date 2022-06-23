import { Controller, Inject, Request, Headers, Delete } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import {
  MongoUserUpdateService,
  MongoVoteFindService,
  MongoVoteDeleteService,
} from "src/Mongo";
import { JwtUserInfo } from "src/Object/Type";
import { tryMultiTransaction } from "src/Util";
import { MONGODB_USER_CONNECTION, MONGODB_VOTE_CONNECTION } from "src/Constant";

@Controller("votes")
export class VoteDeleteController {
  constructor(
    @InjectConnection(MONGODB_USER_CONNECTION)
    private readonly userConnection: Connection,
    @InjectConnection(MONGODB_VOTE_CONNECTION)
    private readonly voteConnection: Connection,
  ) {}

  @Inject() private readonly mongoUserUpdateService: MongoUserUpdateService;
  @Inject() private readonly mongoVoteFindService: MongoVoteFindService;
  @Inject() private readonly mongoVoteDeleteService: MongoVoteDeleteService;

  @Delete("")
  async deleteVote(
    @Request() req: { user: JwtUserInfo },
    @Headers("vote_id") voteId: string,
  ) {
    const userSession = await this.userConnection.startSession();
    const voteSession = await this.voteConnection.startSession();

    await tryMultiTransaction(async () => {
      //* 투표 삭제를 요청한 유저가 투표 작성자인지 여부를 확인합니다.
      const checkIsAuthor = await this.mongoVoteFindService.isVoteAuthor({
        userId: req.user.userId,
        voteId,
      });

      //* 유저 활동 정보 중 업로드한 투표 _id 를 제거합니다.
      const updateUserActivity =
        await this.mongoUserUpdateService.deleteUploadedVote(
          { userId: req.user.userId, voteId },
          userSession,
        );

      //* 투표와 관련된 모든 정보를 삭제합니다.
      const deleteVote = await this.mongoVoteDeleteService.deleteVoteById(
        { voteId },
        voteSession,
      );

      //* 위 세 개 작업을 동시에 수행합니다.
      await Promise.all([checkIsAuthor, updateUserActivity, deleteVote]);
    }, [userSession, voteSession]);
    return;
  }
}
