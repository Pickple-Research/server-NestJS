import { Controller, Inject, Param, Get } from "@nestjs/common";
import { VoteFindService } from "src/Service";
import { MongoVoteFindService } from "src/Mongo";
import { Public } from "src/Security/Metadata";
import { VoteNotFoundException } from "src/Exception";

@Controller("votes")
export class VoteGetController {
  constructor(private readonly voteFindService: VoteFindService) {}

  @Inject() private readonly mongoVoteFindService: MongoVoteFindService;

  /**
   * 테스트 라우터
   * @author 현웅
   */
  @Get("")
  @Public()
  async testVoteRouter() {
    return await this.voteFindService.testVoteRouter();
  }

  @Public()
  @Get(":voteId")
  async getVoteById(@Param("voteId") voteId: string) {
    const [vote, voteParticipation] =
      await this.mongoVoteFindService.getVoteById(voteId);

    if (vote === null || voteParticipation === null) {
      throw new VoteNotFoundException();
    }

    return { vote, voteParticipation };
  }
}
