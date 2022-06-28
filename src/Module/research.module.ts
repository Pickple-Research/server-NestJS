import { Module } from "@nestjs/common";
import {
  ResearchDeleteController,
  ResearchGetController,
  ResearchPatchController,
  ResearchPostController,
} from "src/Controller";
import {
  UserUpdateService,
  ResearchDeleteService,
  ResearchFindService,
  ResearchCreateService,
  ResearchUpdateService,
} from "src/Service";
import { AwsS3Service } from "src/AWS";
import { MongoUserModule, MongoResearchModule } from "src/Mongo";

@Module({
  controllers: [
    ResearchGetController,
    ResearchPatchController,
    ResearchPostController,
    ResearchDeleteController,
  ],
  providers: [
    AwsS3Service,
    UserUpdateService,
    ResearchDeleteService,
    ResearchCreateService,
    ResearchFindService,
    ResearchUpdateService,
  ],
  imports: [MongoUserModule, MongoResearchModule],
})
export class ResearchModule {}
