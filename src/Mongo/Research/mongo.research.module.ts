import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AwsS3Service } from "../../AWS";
import { MongoResearchCreateService } from "./mongo.research.create.service";
import { MongoResearchFindService } from "./mongo.research.find.service";
import { Research, ResearchSchema } from "../../Schema";
import { MONGODB_RESEARCH_CONNECTION } from "../../Constant";

@Module({
  providers: [
    AwsS3Service,
    MongoResearchCreateService,
    MongoResearchFindService,
  ],
  imports: [
    MongooseModule.forFeature(
      [{ name: Research.name, schema: ResearchSchema }],
      MONGODB_RESEARCH_CONNECTION,
    ),
  ],
  exports: [MongoResearchCreateService, MongoResearchFindService],
})
export class MongoResearchModule {}
