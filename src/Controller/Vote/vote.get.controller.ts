import { Controller, Get } from "@nestjs/common";
import { VoteFindService } from "../../Service";
import { Public } from "../../Security/Metadata";

@Controller("votes")
export class VoteGetController {
  constructor(private readonly voteFindService: VoteFindService) {}

  /**
   * 테스트 라우터
   * @author 현웅
   */
  @Public()
  @Get("")
  async testVoteRouter() {
    return await this.voteFindService.testVoteRouter();
  }
}
