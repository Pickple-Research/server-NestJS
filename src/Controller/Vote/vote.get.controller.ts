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
   * 주어진 투표 _id을 기준으로 하여 더 최근의 투표를 모두 찾고 반환합니다.
   * @author 현웅
   */
  @Public()
  @Get("/newer/:voteId")
  async getNewerVotes(@Param("voteId") voteId: string) {
    return await this.mongoVoteFindService.getNewerVotes(voteId);
  }

  /**
   * 주어진 투표 _id을 기준으로 하여 과거의 투표 10개를 찾고 반환합니다.
   * @author 현웅
   */
  @Public()
  @Get("/older/:voteId")
  async getOlderVotes(@Param("voteId") voteId: string) {
    return await this.mongoVoteFindService.getOlderVotes(voteId);
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
