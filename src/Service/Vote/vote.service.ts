import { Injectable } from "@nestjs/common";
import { MongoVoteService } from "../../Mongo";

@Injectable()
export class VoteService {
  constructor(private readonly mongoVoteService: MongoVoteService) {}

  // Get Requests
  /**
   * 테스트 라우터
   * @author 현웅
   */
  async testVoteRouter() {
    return "testVoteRouter";
  }
  // Post Requests

  // Patch Requests

  // Put Requests

  // Delete Requests
}
