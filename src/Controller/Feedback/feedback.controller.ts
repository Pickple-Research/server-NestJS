import { Body, Controller, Get, Post } from "@nestjs/common";
import { FeedbackService } from "../../Service";
import { Feedback } from "../../Schema";

@Controller("feedback")
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  // Get Requests
  // 테스트 API
  @Get("")
  async testFeedbackRouter() {
    return await this.feedbackService.testFeedbackRouter();
  }
}
