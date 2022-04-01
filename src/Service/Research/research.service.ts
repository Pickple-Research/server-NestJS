import { Injectable } from "@nestjs/common";
import { MongoResearchService } from "../../Mongo";

@Injectable()
export class ResearchService {
  constructor(private readonly mongoResearchService: MongoResearchService) {}

  // Get Requests
  /**
   * 테스트 라우터
   * @author 현웅
   */
  async testResearchRouter() {
    return "testResearchRouter";
  }

  // Post Requests

  // Patch Requests

  // Put Requests

  // Delete Requests
}
