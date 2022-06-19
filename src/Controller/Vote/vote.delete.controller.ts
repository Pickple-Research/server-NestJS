import { Controller, Inject, Request, Headers, Delete } from "@nestjs/common";
import { MongoVoteFindService, MongoVoteDeleteService } from "src/Mongo";
import { JwtUserInfo } from "src/Object/Type";

@Controller("votes")
export class VoteDeleteController {
  constructor() {}

  @Inject() private readonly mongoVoteFindService: MongoVoteFindService;
  @Inject() private readonly mongoVoteDeleteService: MongoVoteDeleteService;

  @Delete("")
  async deleteVote(
    @Request() req: { user: JwtUserInfo },
    @Headers("vote_id") vote_id: string,
  ) {
    //* 투표 삭제를 요청한 유저가 투표 작성자인지 여부를 확인합니다.
    const checkIsAuthor = await this.mongoVoteFindService.isVoteAuthor({
      userId: req.user.userId,
      voteId: vote_id,
    });
    //* 투표를 삭제합니다.
    const deleteVote = await this.mongoVoteDeleteService.deleteVoteById(
      vote_id,
    );
    await Promise.all([checkIsAuthor, deleteVote]);
    return;
  }
}
