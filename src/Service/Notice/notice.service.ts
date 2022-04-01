import { Injectable } from "@nestjs/common";
import { MongoNoticeService } from "../../Mongo";

@Injectable()
export class NoticeService {
  constructor(private readonly mongoNoticeService: MongoNoticeService) {}

  // Get Requests
  /**
   * 테스트 라우터
   * @author 현웅
   */
  async testNoticeRouter() {
    return "testNoticeRouter";
  }

  // Post Requests

  // Patch Requests

  // Put Requests

  // Delete Requests
}
