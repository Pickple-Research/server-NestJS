import { Injectable } from "@nestjs/common";
import { UserSignupDto } from "../../Dto";
import { MongoUserService } from "../../Mongo/mongo.user.service";

@Injectable()
export class UserService {
  constructor(private readonly mongoUserService: MongoUserService) {}

  /**
   * 테스트 라우터
   * @author 현웅
   */
  async testUserRouter() {
    return "user.service";
  }

  /**
   * userSignupDto 형태의 인자를 받아 회원가입 합니다.
   * @author 현웅
   */
  async signup(userSignupDto: UserSignupDto) {
    return;
  }

  /**
   * 유저 특성 정보를 수정합니다.
   * @author 현웅
   */
  async updateUserProperty() {
    return;
  }
  // Patch Requests
  // Delete Requests
}
