import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MongoVoteFindService } from "./mongo.vote.find.service";
import { Vote, VoteSchema } from "../../Schema";
import { MONGODB_VOTE_CONNECTION } from "../../Constant";

@Module({
  providers: [MongoVoteFindService],
  imports: [
    MongooseModule.forFeature(
      [{ name: Vote.name, schema: VoteSchema }],
      MONGODB_VOTE_CONNECTION,
    ),
  ],
  exports: [MongoVoteFindService],
})
export class MongoVoteModule {}
