import { Controller, Get } from "@nestjs/common";
import { UserFindService } from "../../Service";
import { Public } from "../../Security/Metadata";

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
