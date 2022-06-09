import { Controller, Inject, Delete } from "@nestjs/common";
import { MongoVoteDeleteService } from "src/Mongo";

@Controller("votes")
export class VoteDeleteController {
  constructor() {}

  @Inject() private readonly mongoVoteDeleteService: MongoVoteDeleteService;

  @Delete("")
  async deleteVote() {
    // return await this.mongoVoteDeleteService.deleteVote();
  }
}
