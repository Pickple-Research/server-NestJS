import { Module } from "@nestjs/common";
import {
  ResearchGetController,
  ResearchPatchController,
  ResearchPostController,
} from "src/Controller";
import {
  UserUpdateService,
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
  ],
  providers: [
    AwsS3Service,
    UserUpdateService,
    ResearchCreateService,
    ResearchFindService,
    ResearchUpdateService,
  ],
  imports: [MongoUserModule, MongoResearchModule],
})
export class ResearchModule {}
