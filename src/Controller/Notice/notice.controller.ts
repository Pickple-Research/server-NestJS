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
import { NoticeService } from "../../Service";
import { Public } from "../../Security/Metadata";

@Controller("notices")
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  // Get Requests
  /**
   * 테스트 라우터
   * @author 현웅
   */
  @Public()
  @Get("")
  async testNoticeRouter() {
    return await this.noticeService.testNoticeRouter();
  }

  // Post Requests

  // Patch Requests

  // Put Requests

  // Delete Requests
}
