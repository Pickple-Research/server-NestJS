import { Controller, Get } from "@nestjs/common";
import { UserFindService } from "src/Service";
import { Public } from "src/Security/Metadata";

@Controller("users")
export class UserGetController {
  constructor(private readonly userFindService: UserFindService) {}

  /**
   * 테스트 라우터
   * @author 현웅
   */
  @Public()
  @Get("test")
  async testUserRouter() {
    return await this.userFindService.testUserRouter();
  }
}
