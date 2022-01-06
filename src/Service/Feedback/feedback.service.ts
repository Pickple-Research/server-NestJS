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

  async testFeedbackRouter() {
    return;
  }
}
