import { Module } from "@nestjs/common";
import {
  VoteGetController,
  VotePostController,
  VotePatchController,
  VoteDeleteController,
} from "src/Controller";
import { VoteFindService } from "src/Service";
import { MongoUserModule, MongoVoteModule } from "src/Mongo";

@Module({
  controllers: [
    VoteGetController,
    VotePostController,
    VotePatchController,
    VoteDeleteController,
  ],
  providers: [VoteFindService],
  imports: [MongoUserModule, MongoVoteModule],
})
export class VoteModule {}
