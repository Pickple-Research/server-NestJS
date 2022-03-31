import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { VoteController } from "../Controller";
import { VoteService } from "../Service";
import { MongoVoteService } from "../Mongo";
import { Vote, VoteSchema } from "../Schema";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Vote.name, schema: VoteSchema }],
      "vote",
    ),
  ],
  controllers: [VoteController],
  providers: [VoteService, MongoVoteService],
})
export class VoteModule {}
