import { Injectable, Inject } from "@nestjs/common";
import { MongoResearchFindService } from "src/Mongo";

@Injectable()
export class ResearchFindService {
  constructor() {}

  @Inject() private readonly mongoResearchFindService: MongoResearchFindService;
}
