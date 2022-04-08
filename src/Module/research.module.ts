import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ResearchGetController, ResearchPostController } from "../Controller";
import { ResearchFindService, ResearchCreateService } from "../Service";
import { AwsS3Service } from "../AWS";
import { MongoResearchCreateService, MongoResearchFindService } from "../Mongo";
import { Research, ResearchSchema } from "../Schema";
import { MONGODB_RESEARCH_CONNECTION } from "../Constant";

@Module({
  controllers: [ResearchGetController, ResearchPostController],
  providers: [
    ResearchCreateService,
    ResearchFindService,
    MongoResearchCreateService,
    MongoResearchFindService,
    AwsS3Service,
  ],
  imports: [
    MongooseModule.forFeature(
      [{ name: Research.name, schema: ResearchSchema }],
      MONGODB_RESEARCH_CONNECTION,
    ),
  ],
})
export class ResearchModule {}
