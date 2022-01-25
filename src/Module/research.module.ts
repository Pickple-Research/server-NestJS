import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ResearchController } from "../Controller";
import { ResearchService } from "../Service";
import { Research, ResearchSchema } from "../Schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Research.name, schema: ResearchSchema },
    ]),
  ],
  controllers: [ResearchController],
  providers: [ResearchService],
})
export class ResearchModule {}
