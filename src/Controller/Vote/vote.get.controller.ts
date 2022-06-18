import { Controller, Inject, Param, Get } from "@nestjs/common";
import { MongoVoteFindService } from "src/Mongo";
import { Public } from "src/Security/Metadata";
import { VoteNotFoundException } from "src/Exception";

@Controller("votes")
export class VoteGetController {
  constructor() {}

  @Inject() private readonly mongoVoteFindService: MongoVoteFindService;

  /**
   * 모든 투표를 가져옵니다.
   * @author 현웅
   */
  @Public()
  @Get("")
  async getVotes() {
    return await this.mongoVoteFindService.getVotes();
  }

  /**
   * _id로 특정 투표를 가져옵니다.
   * @author 현웅
   */
  @Public()
  @Get(":voteId")
  async getVoteById(@Param("voteId") voteId: string) {
    const vote = await this.mongoVoteFindService.getVoteById(voteId);

    if (vote === null || vote.deleted) {
      throw new VoteNotFoundException();
    }

    return vote;
  }

  @Public()
  @Get(":voteId/comments")
  async getVoteComments(@Param("voteId") voteId: string) {
    return await this.mongoVoteFindService.getVoteComments(voteId);
  }
}
