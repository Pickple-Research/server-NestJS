import { Controller, Headers, Body, Post } from "@nestjs/common";
import { UserCreateService } from "../../Service";

/**
 * 테스트 유저 계정을 만드는 Controller입니다. 일반 유저 회원가입은 auth module을 참고하세요.
 * @author 현웅
 */
@Controller("users")
export class UserPostController {
  constructor(private readonly userCreateService: UserCreateService) {}

  /**
   * @author 현웅
   */
  @Post("")
  async createTestUser() {
    return "createTestUser";
  }
}
