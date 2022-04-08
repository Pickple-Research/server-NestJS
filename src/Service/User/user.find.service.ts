import { Injectable } from "@nestjs/common";
import { MongoUserFindService } from "../../Mongo";

@Injectable()
export class UserFindService {
  constructor(private readonly mongoUserFindService: MongoUserFindService) {}

  /**
   * @Get
   * 테스트 라우터
   * @author 현웅
   */
  async testUserRouter() {
    return await this.mongoUserFindService.getUserById("");
  }
}
