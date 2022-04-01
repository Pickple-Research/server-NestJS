import {
  Controller,
  Headers,
  Body,
  Get,
  Post,
  Patch,
  Put,
  Delete,
} from "@nestjs/common";
import { ResearchService } from "../../Service";
import { Public } from "../../Security/Metadata";

@Controller("researches")
export class ResearchController {
  constructor(private readonly researchService: ResearchService) {}

  // Get Requests
  /**
   * 테스트 라우터
   * @author 현웅
   */
  @Public()
  @Get("")
  async testResearchRouter() {
    return await this.researchService.testResearchRouter();
  }

  // Post Requests

  // Patch Requests

  // Put Requests

  // Delete Requests
}
