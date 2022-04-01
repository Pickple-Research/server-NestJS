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
import { FeedbackService } from "../../Service";
import { Public } from "../../Security/Metadata";

@Controller("feedbacks")
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  // Get Requests
  /**
   * 테스트 라우터
   * @author 현웅
   */
  @Public()
  @Get("")
  async testFeedbackRouter() {
    return await this.feedbackService.testFeedbackRouter();
  }

  // Post Requests

  // Patch Requests

  // Put Requests

  // Delete Requests
}
