import { Module } from "@nestjs/common";
import { VoteGetController } from "../Controller";
import { VoteFindService } from "../Service";
import { MongoVoteModule } from "../Mongo";

@Module({
  controllers: [VoteGetController],
  providers: [VoteFindService],
  imports: [MongoVoteModule],
})
export class VoteModule {}
