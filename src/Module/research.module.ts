import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ResearchController } from "../Controller";
import { ResearchService } from "../Service";
import { Research, ResearchSchema } from "../OldSchema";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Research.name, schema: ResearchSchema }],
      "main",
    ),
  ],
  controllers: [ResearchController],
  providers: [ResearchService],
})
export class ResearchModule {}
