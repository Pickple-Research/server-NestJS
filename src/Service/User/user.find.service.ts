import { Injectable, Inject } from "@nestjs/common";
import { MongoUserFindService } from "../../Mongo";

@Injectable()
export class UserFindService {
  constructor() {}

  @Inject() private readonly mongoUserFindService: MongoUserFindService;

  /**
   * @Get
   * 테스트 라우터
   * @author 현웅
   */
  async testUserRouter() {
    return "testUserRouter with tag";
  }
}
