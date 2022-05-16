import { Injectable, Inject } from "@nestjs/common";
import { MongoResearchDeleteService } from "src/Mongo";

@Injectable()
export class ResearchDeleteService {
  constructor() {}

  @Inject()
  private readonly mongoResearchDeleteService: MongoResearchDeleteService;
}
