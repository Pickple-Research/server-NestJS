import { Module } from "@nestjs/common";
import { ResearchGetController, ResearchPostController } from "../Controller";
import { ResearchFindService, ResearchCreateService } from "../Service";
import { AwsS3Service } from "../AWS";
import { MongoResearchModule } from "../Mongo";

@Module({
  controllers: [ResearchGetController, ResearchPostController],
  providers: [ResearchCreateService, ResearchFindService, AwsS3Service],
  imports: [MongoResearchModule],
})
export class ResearchModule {}
