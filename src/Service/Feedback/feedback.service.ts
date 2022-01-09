import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Feedback, FeedbackDocument } from "../../Schema";

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(Feedback.name)
    private readonly Feedback: Model<FeedbackDocument>,
  ) {}

  // Get Requests
  // 전체 피드백 반환
  async getAllFeedback() {
    return;
  }
  // 특정 피드백 반환
  async getCertainFeedbackById() {
    return;
  }

  // Post Requests
  // 피드백 생성
  async createFeedback() {
    return;
  }
  // 피드백 댓글 생성
  async createFeedbackComment() {
    return;
  }

  // Put Requests
  // 피드백 수정
  async updateFeedback() {
    return;
  }

  // Delete Requests
  // 피드백 삭제
  async deleteFeedback() {
    return;
  }
}
