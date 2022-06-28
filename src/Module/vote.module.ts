import { Module } from "@nestjs/common";
import {
  VoteGetController,
  VotePostController,
  VotePatchController,
  VoteDeleteController,
} from "src/Controller";
import {
  UserUpdateService,
  VoteFindService,
  VoteDeleteService,
  VoteUpdateService,
} from "src/Service";
import { MongoUserModule, MongoVoteModule } from "src/Mongo";

@Module({
  controllers: [
    VoteGetController,
    VotePostController,
    VotePatchController,
    VoteDeleteController,
  ],
  providers: [
    UserUpdateService,
    VoteFindService,
    VoteDeleteService,
    VoteUpdateService,
  ],
  imports: [MongoUserModule, MongoVoteModule],
})
export class VoteModule {}
