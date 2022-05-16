import { Module } from "@nestjs/common";
import {
  ResearchDeleteController,
  ResearchGetController,
  ResearchPatchController,
  ResearchPostController,
} from "src/Controller";
import {
  ResearchDeleteService,
  ResearchFindService,
  ResearchCreateService,
  ResearchUpdateService,
} from "src/Service";
import { AwsS3Service } from "src/AWS";
import { MongoResearchModule } from "src/Mongo";

@Module({
  controllers: [
    ResearchGetController,
    ResearchPatchController,
    ResearchPostController,
    ResearchDeleteController,
  ],
  providers: [
    AwsS3Service,
    ResearchDeleteService,
    ResearchCreateService,
    ResearchFindService,
    ResearchUpdateService,
  ],
  imports: [MongoResearchModule],
})
export class ResearchModule {}
