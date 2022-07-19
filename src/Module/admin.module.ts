import { Module } from "@nestjs/common";
import { AdminController } from "src/Controller";
import { FirebaseService } from "src/Firebase";
import {
  MongoUserModule,
  MongoResearchModule,
  MongoVoteModule,
} from "src/Mongo";

@Module({
  controllers: [AdminController],
  providers: [FirebaseService],
  imports: [MongoUserModule, MongoResearchModule, MongoVoteModule],
})
export class AdminModule {}
