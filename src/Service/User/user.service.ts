import { Injectable } from "@nestjs/common";
import { MongoUserService } from "../../Mongo";
import { UserSignupDto } from "../../Dto";

@Injectable()
export class UserService {
  constructor(private readonly mongoUserService: MongoUserService) {}

  // Get Requests
  /**
   * 테스트 라우터
   * @author 현웅
   */
  async testUserRouter() {
    return "PickpleResearch: testUserRouter";
  }

  // Post Requests
  /**
   * userSignupDto 형태의 인자를 받아 회원가입 합니다.
   * @author 현웅
   */
  async signup(userSignupDto: UserSignupDto) {
    return;
  }

  async create() {
    return await this.mongoUserService.createNewUser();
  }

  // Patch Requests

  // Put Requests

  // Delete Requests
}
