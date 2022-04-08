import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { VoteGetController } from "../Controller";
import { VoteFindService } from "../Service";
import { MongoVoteFindService } from "../Mongo";
import { Vote, VoteSchema } from "../Schema";
import { MONGODB_VOTE_CONNECTION } from "../Constant";

@Module({
  controllers: [VoteGetController],
  providers: [VoteFindService, MongoVoteFindService],
  imports: [
    MongooseModule.forFeature(
      [{ name: Vote.name, schema: VoteSchema }],
      MONGODB_VOTE_CONNECTION,
    ),
  ],
})
export class VoteModule {}
