import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ResearchController } from "../Controller";
import { ResearchService } from "../Service";
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
  providers: [ResearchService, MongoResearchService],
})
export class ResearchModule {}
