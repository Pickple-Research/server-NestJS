import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MongoVoteFindService } from "./mongo.vote.find.service";
import { MongoVoteCreateService } from "./mongo.vote.create.service";
import { MongoVoteUpdateService } from "./mongo.vote.update.service";
import { MongoVoteDeleteService } from "./mongo.vote.delete.service";
import {
  Vote,
  VoteSchema,
  VoteComment,
  VoteCommentSchema,
  VoteParticipation,
  VoteParticipationSchema,
  VoteReply,
  VoteReplySchema,
  VoteReport,
  VoteReportSchema,
  VoteScrap,
  VoteScrapSchema,
  VoteUser,
  VoteUserSchema,
} from "src/Schema";
import { MONGODB_VOTE_CONNECTION } from "src/Constant";

@Module({
  providers: [
    MongoVoteFindService,
    MongoVoteCreateService,
    MongoVoteUpdateService,
    MongoVoteDeleteService,
  ],
  imports: [
    MongooseModule.forFeature(
      [
        { name: Vote.name, schema: VoteSchema },
        { name: VoteComment.name, schema: VoteCommentSchema },
        { name: VoteParticipation.name, schema: VoteParticipationSchema },
        { name: VoteReply.name, schema: VoteReplySchema },
        { name: VoteReport.name, schema: VoteReportSchema },
        { name: VoteScrap.name, schema: VoteScrapSchema },
        { name: VoteUser.name, schema: VoteUserSchema },
      ],
      MONGODB_VOTE_CONNECTION,
    ),
  ],
  exports: [
    MongoVoteFindService,
    MongoVoteCreateService,
    MongoVoteUpdateService,
    MongoVoteDeleteService,
  ],
})
export class MongoVoteModule {}
