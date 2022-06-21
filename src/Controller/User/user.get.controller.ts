import { Controller, Inject, Get, Request, Body } from "@nestjs/common";
import { UserFindService } from "src/Service";
import { MongoUserFindService } from "src/Mongo";
import { Public } from "src/Security/Metadata";
import { JwtUserInfo } from "src/Object/Type";

@Controller("users")
export class UserGetController {
  constructor(private readonly userFindService: UserFindService) { }

  @Inject() private readonly mongoUserFindService: MongoUserFindService;

  /**
   * 테스트 라우터
   * @author 현웅
   */
  @Public()
  @Get("test")
  async testUserRouter(@Request() req: { user: JwtUserInfo }) {
    return req.user;
  }

  @Public()
  @Get("users")
  async getUsers(@Body() userId: string, num: number, page: number) {
    return this.mongoUserFindService.getUsers(userId, num, page);
  }


}
