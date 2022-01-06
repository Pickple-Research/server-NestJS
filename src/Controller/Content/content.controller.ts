import { Body, Controller, Get, Post } from "@nestjs/common";
import { ContentService } from "../../Service";
import { Content } from "../../Schema";

@Controller("content")
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  // Get Requests
  // 테스트 API
  @Get("")
  async testContentRouter() {
    return await this.contentService.testContentRouter();
  }
}
