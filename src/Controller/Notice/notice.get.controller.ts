import { Controller, Get } from "@nestjs/common";
import { NoticeFindService } from "../../Service";
import { Public } from "../../Security/Metadata";

@Controller("notices")
export class NoticeGetController {
  constructor(private readonly noticeFindService: NoticeFindService) {}

  /**
   * 테스트 라우터
   * @author 현웅
   */
  @Public()
  @Get("test")
  async testNoticeRouter() {
    return await this.noticeFindService.testNoticeRouter();
  }
}
