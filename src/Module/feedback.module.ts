import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { FeedbackGetController } from "../Controller";
import { FeedbackFindService } from "../Service";
import { MongoFeedbackFindService } from "../Mongo";
import { Feedback, FeedbackSchema } from "../Schema";
import { MONGODB_FEEDBACK_CONNECTION } from "../Constant";

@Module({
  controllers: [FeedbackGetController],
  providers: [FeedbackFindService, MongoFeedbackFindService],
  imports: [
    MongooseModule.forFeature(
      [{ name: Feedback.name, schema: FeedbackSchema }],
      MONGODB_FEEDBACK_CONNECTION,
    ),
  ],
})
export class FeedbackModule {}
