import { Controller, Inject, Headers, Delete } from "@nestjs/common";
import { MongoVoteDeleteService } from "src/Mongo";

@Controller("votes")
export class VoteDeleteController {
  constructor() {}

  @Inject() private readonly mongoVoteDeleteService: MongoVoteDeleteService;

  @Delete("")
  async deleteVote(@Headers("vote_id") vote_id: string) {
    return await this.mongoVoteDeleteService.deleteVoteById(vote_id);
  }
}
