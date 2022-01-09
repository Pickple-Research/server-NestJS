import {
  Headers,
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
} from "@nestjs/common";
import { NoticeService } from "../../Service";
import { Notice } from "../../Schema";

@Controller("notice")
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  // Get Requests
  // 전체 공지 반환
  @Get("")
  async getAllNotice() {
    return await this.noticeService.getAllNotice();
  }

  // Post Requests
  // 공지 생성
  @Post("")
  async createNotice() {
    return await this.noticeService.createNotice();
  }

  // Put Requests
  // 공지 수정
  @Put("")
  async updateNotice(@Body() body) {
    return await this.noticeService.updateNotice();
  }

  // Delete Requests
  // 공지 삭제
  @Delete("")
  async deleteNotice(@Headers() header) {
    return await this.noticeService.deleteNotice();
  }
}
