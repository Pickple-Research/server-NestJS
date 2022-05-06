import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AwsS3Service } from "src/AWS";
import {
  MongoResearchCreateService,
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
} from "src/Schema";
import { MONGODB_RESEARCH_CONNECTION } from "src/Constant";

@Module({
  providers: [
    AwsS3Service,
    MongoResearchCreateService,
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
      ],
      MONGODB_RESEARCH_CONNECTION,
    ),
  ],
  exports: [
    MongoResearchCreateService,
    MongoResearchFindService,
    MongoResearchUpdateService,
  ],
})
export class MongoResearchModule {}
