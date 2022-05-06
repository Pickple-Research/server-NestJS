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
   * 이메일을 이용하여 회원가입을 시도하는 유저 데이터를 생성합니다.
   * TODO: 생성되고 1주일 뒤 삭제되도록 동적 cronjob을 정의해야 합니다.
   * @author 현웅
   */
  @Post("/unauthorized")
  async createUnauthorizedUser() {
    return "user.post.controller# createUnauthorizedUser()";
  }

  /**
   * 이메일을 사용해 회원가입하는 유저를 생성합니다.
   * @author 현웅
   */
  @Post("")
  async createEmailUser() {
    return await this.userCreateService.createEmailUser();
  }
}
