import { Injectable } from "@nestjs/common";
import { MongoVoteFindService } from "../../Mongo";

@Injectable()
export class VoteFindService {
  constructor(private readonly mongoVoteFindService: MongoVoteFindService) {}

  /**
   * @Get
   * 테스트 라우터
   * @author 현웅
   */
  async testVoteRouter() {
    return "testVoteRouter";
  }
}
