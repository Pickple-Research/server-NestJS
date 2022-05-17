import { Controller, Inject, Get } from "@nestjs/common";
import { UserFindService } from "src/Service";
import { MongoUserFindService } from "src/Mongo";
import { Public } from "src/Security/Metadata";

@Controller("users")
export class UserGetController {
  constructor(private readonly userFindService: UserFindService) {}

  @Inject() private readonly mongoUserFindService: MongoUserFindService;

  /**
   * 테스트 라우터
   * @author 현웅
   */
  @Public()
  @Get("test")
  async testUserRouter() {
    return await this.mongoUserFindService.testMongoUserRouter();
  }
}
