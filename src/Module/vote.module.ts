import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { VoteController } from "../Controller";
import { VoteService } from "../Service";
import { MongoVoteService } from "../Mongo";
import { Vote, VoteSchema } from "../Schema";
import { MONGODB_VOTE_CONNECTION } from "../Constant";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Vote.name, schema: VoteSchema }],
      MONGODB_VOTE_CONNECTION,
    ),
  ],
  controllers: [VoteController],
  providers: [VoteService, MongoVoteService],
})
export class VoteModule {}
