import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AwsS3Service } from "src/AWS";
import {
  MongoResearchCreateService,
  MongoResearchDeleteService,
  MongoResearchFindService,
  MongoResearchUpdateService,
} from "src/Mongo";
import {
  Research,
  ResearchSchema,
  ResearchComment,
  ResearchCommentSchema,
  ResearchParticipation,
  ResearchParticipationSchema,
  ResearchReply,
  ResearchReplySchema,
} from "src/Schema";
import { MONGODB_RESEARCH_CONNECTION } from "src/Constant";

@Module({
  providers: [
    AwsS3Service,
    MongoResearchCreateService,
    MongoResearchDeleteService,
    MongoResearchFindService,
    MongoResearchUpdateService,
  ],
  imports: [
    MongooseModule.forFeature(
      [
        { name: Research.name, schema: ResearchSchema },
        {
          name: ResearchComment.name,
          schema: ResearchCommentSchema,
        },
        {
          name: ResearchParticipation.name,
          schema: ResearchParticipationSchema,
        },
        {
          name: ResearchReply.name,
          schema: ResearchReplySchema,
        },
      ],
      MONGODB_RESEARCH_CONNECTION,
    ),
  ],
  exports: [
    MongoResearchCreateService,
    MongoResearchDeleteService,
    MongoResearchFindService,
    MongoResearchUpdateService,
  ],
})
export class MongoResearchModule {}
