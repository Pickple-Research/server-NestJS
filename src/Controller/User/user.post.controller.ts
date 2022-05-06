import { Controller, Body, Post } from "@nestjs/common";
import { EmailUserSignupDto, EmailUserAuthorizationBodyDto } from "src/Dto";
import { UserCreateService } from "src/Service";
import { getCurrentISOTime } from "src/Util";

/**
 * 테스트 유저 계정을 만드는 Controller입니다. 일반 유저 회원가입은 auth module을 참고하세요.
 * @author 현웅
 */
@Controller("users")
export class UserPostController {
  constructor(private readonly userCreateService: UserCreateService) {}

  /**
   * 이메일을 이용하여 회원가입하는 미인증 유저 데이터를 생성합니다.
   * TODO: 생성되고 1주일 뒤 삭제되도록 동적 cronjob을 정의해야 합니다.
   * @author 현웅
   */
  @Post("/unauthorized")
  async createUnauthorizedUser(@Body() emailUserSignupDto: EmailUserSignupDto) {
    return await this.userCreateService.createUnauthorizedUser({
      ...emailUserSignupDto,
      //* Body로 주어진 email과 password 정보에 인증 번호와 생성시간을 추가합니다.
      authorizationCode: (
        "00000" + Math.floor(Math.random() * 1_000_000).toString()
      ).slice(-6),
      createdAt: getCurrentISOTime(),
    });
  }

  /**
   * 이메일 미인증 유저를 정규유저로 전환합니다.
   * @author 현웅
   */
  @Post("/email")
  async createEmailUser(@Body() body: EmailUserAuthorizationBodyDto) {
    return await this.userCreateService.createEmailUser(body.email, body.code);
  }
}
