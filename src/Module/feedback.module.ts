import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { FeedbackController } from "../Controller";
import { FeedbackService } from "../Service";
import { MongoFeedbackService } from "../Mongo";
import { Feedback, FeedbackSchema } from "../Schema";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Feedback.name, schema: FeedbackSchema }],
      "feedback",
    ),
  ],
  controllers: [FeedbackController],
  providers: [FeedbackService, MongoFeedbackService],
})
export class FeedbackModule {}
