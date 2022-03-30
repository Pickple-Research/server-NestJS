import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { FeedbackController } from "../Controller";
import { FeedbackService } from "../Service";
import { Feedback, FeedbackSchema } from "../OldSchema";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Feedback.name, schema: FeedbackSchema }],
      "main",
    ),
  ],
  controllers: [FeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule {}
