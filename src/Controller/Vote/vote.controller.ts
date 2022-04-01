import {
  Controller,
  Headers,
  Body,
  Get,
  Post,
  Patch,
  Put,
  Delete,
} from "@nestjs/common";
import { VoteService } from "../../Service";
import { Public } from "../../Security/Metadata";

@Controller("votes")
export class VoteController {
  constructor(private readonly voteService: VoteService) {}

  // Get Requests
  /**
   * 테스트 라우터
   * @author 현웅
   */
  @Public()
  @Get("")
  async testVoteRouter() {
    return await this.voteService.testVoteRouter();
  }

  // Post Requests

  // Patch Requests

  // Put Requests

  // Delete Requests
}
