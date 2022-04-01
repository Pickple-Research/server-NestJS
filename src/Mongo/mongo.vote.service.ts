import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Vote, VoteDocument } from "../Schema";

@Injectable()
export class MongoVoteService {
  constructor(
    @InjectModel(Vote.name) private readonly Vote: Model<VoteDocument>,
  ) {}
}
