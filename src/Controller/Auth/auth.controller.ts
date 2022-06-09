import { Controller, Inject, Body, Get, Post } from "@nestjs/common";
import { AuthService } from "src/Service";
import { MongoUserFindService, MongoUserCreateService } from "src/Mongo";
import { Public } from "src/Security/Metadata";
import { LoginBodyDto, AuthCodeVerificationBodyDto } from "src/Dto";
import { WrongAuthorizationCodeException } from "src/Exception";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Inject() private readonly mongoUserFindService: MongoUserFindService;
  @Inject() private readonly mongoUserCreateService: MongoUserCreateService;

  /**
   * 테스트 라우터
   * @author 현웅
   */
  @Public()
  @Get("test")
  async testAuthRouter() {
    return "test Auth Router";
  }

  /**
   * 이메일, 비밀번호를 받아 로그인합니다.
   * 이메일과 비밀번호가 일치하지 않는다면 에러를 일으키고,
   * 일치한다면 JWT를 발급합니다.
   * @author 현웅
   */
  @Public()
  @Post("login")
  async login(@Body() body: LoginBodyDto) {
    return await this.mongoUserFindService.login(body.email, body.password);

    // return await this.authService.issueJWT({
    //   userId: user._id,
    //   userEmail: user.email,
    // });
  }

  /**
   * 이메일 미인증 유저의 인증 코드를 검증하고 정규유저로 전환합니다.
   * @author 현웅
   */
  @Public()
  @Post("verify")
  async verifyEmailUser(@Body() body: AuthCodeVerificationBodyDto) {
    //* 입력한 인증 번호가 다르거나
    //* 해당 이메일을 사용하는 유저가 존재하지 않으면 에러를 일으킵니다.
    if (
      !(await this.mongoUserFindService.checkUnauthorizedUserCode(
        body.email,
        body.code,
      ))
    ) {
      throw new WrongAuthorizationCodeException();
    }

    //* 인증번호가 일치하는 경우 정규유저로 전환합니다.
    await this.mongoUserCreateService.authorizeEmailUser(body.email);
    return true;
  }

  /**
   * refresh 토큰을 받아 Jwt를 발급합니다.
   * @author 현웅
   */
  @Public()
  @Post("refresh")
  async refreshJwt(refreshToken: string) {}
}
