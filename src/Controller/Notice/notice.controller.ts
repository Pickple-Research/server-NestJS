import { Body, Controller, Get, Post } from "@nestjs/common";
import { NoticeService } from "../../Service";
import { Notice } from "../../Schema";

@Controller("notice")
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  // Get Requests
  // 테스트 API
  @Get("")
  async testNoticeRouter() {
    return await this.noticeService.testNoticeRouter();
  }
}
