import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Research, ResearchDocument } from "../Schema";

@Injectable()
export class MongoResearchService {
  constructor(
    @InjectModel(Research.name)
    private readonly Research: Model<ResearchDocument>,
  ) {}
}
