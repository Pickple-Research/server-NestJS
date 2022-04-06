import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ResearchController } from "../Controller";
import { ResearchService } from "../Service";
import { AwsS3Service } from "../AWS";
import { MongoResearchService } from "../Mongo";
import { Research, ResearchSchema } from "../Schema";
import { MONGODB_RESEARCH_CONNECTION } from "../Constant";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Research.name, schema: ResearchSchema }],
      MONGODB_RESEARCH_CONNECTION,
    ),
  ],
  controllers: [ResearchController],
  providers: [ResearchService, AwsS3Service, MongoResearchService],
})
export class ResearchModule {}
