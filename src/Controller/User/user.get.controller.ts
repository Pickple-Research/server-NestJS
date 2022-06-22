import { Controller, Inject, Get, Request, Body } from "@nestjs/common";
import { UserFindService } from "src/Service";
import { MongoUserFindService } from "src/Mongo";
import { Public, Roles } from "src/Security/Metadata";
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


  /**
   *  
   * 유저 정보 5개씩 가져오기
   * @author 승원
   * 
   */
  @Public()//추후 변경예정
  @Get("users")
  @Roles("ADMIN")//요청을 보내는 사람의 userType을 확인
  async getUsers(@Body() userId: string, num: number, page: number) {
    return this.mongoUserFindService.getUsers(userId, num, page);
  }


}
