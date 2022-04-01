import { Injectable } from "@nestjs/common";
import { MongoFeedbackService } from "../../Mongo";

@Injectable()
export class FeedbackService {
  constructor(private readonly mongoFeedbackService: MongoFeedbackService) {}

  // Get Requests
  /**
   * 테스트 라우터
   * @author 현웅
   */
  async testFeedbackRouter() {
    return "testFeedbackRouter";
  }

  // Post Requests

  // Patch Requests

  // Put Requests

  // Delete Requests
}
