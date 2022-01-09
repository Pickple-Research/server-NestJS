import {
  Headers,
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
} from "@nestjs/common";
import { FeedbackService } from "../../Service";
import { Feedback } from "../../Schema";

@Controller("feedback")
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  // Get Requests
  // 전체 피드백 반환
  @Get("")
  async getAllFeedback() {
    return await this.feedbackService.getAllFeedback();
  }

  // 특정 피드백 반환
  @Get("feedback-id/:feedback_id")
  async getCertainFeedbackById() {
    return await this.feedbackService.getCertainFeedbackById();
  }

  // Post Requests
  // 피드백 생성
  @Post("")
  async createFeedback() {
    return await this.feedbackService.createFeedback();
  }

  // 피드백 댓글 생성
  @Post("comment")
  async createFeedbackComment() {
    return await this.feedbackService.createFeedbackComment();
  }

  // Put Requests
  // 피드백 수정
  @Put("")
  async updateFeedback(@Body() body) {
    return await this.feedbackService.updateFeedback();
  }

  // Delete Requests
  // 피드백 삭제
  @Delete("")
  async deleteFeedback(@Headers() header) {
    return await this.feedbackService.deleteFeedback();
  }
}
