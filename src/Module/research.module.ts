import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ResearchController } from "../Controller";
import { ResearchService } from "../Service";
import { MongoResearchService } from "../Mongo";
import { Research, ResearchSchema } from "../Schema";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Research.name, schema: ResearchSchema }],
      "research",
    ),
  ],
  controllers: [ResearchController],
  providers: [ResearchService, MongoResearchService],
})
export class ResearchModule {}
