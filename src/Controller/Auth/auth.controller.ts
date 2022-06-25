import { Controller, Inject, Request, Body, Post } from "@nestjs/common";
import { AuthService } from "src/Service";
import { MongoUserFindService, MongoUserUpdateService } from "src/Mongo";
import { Public } from "src/Security/Metadata";
import { LoginBodyDto, AuthCodeVerificationBodyDto } from "src/Dto";
import { JwtUserInfo } from "src/Object/Type";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Inject() private readonly mongoUserFindService: MongoUserFindService;
  @Inject() private readonly mongoUserUpdateService: MongoUserUpdateService;

  /**
   * 이메일, 비밀번호를 받아 로그인합니다.
   * 이메일과 비밀번호가 일치하지 않는다면 에러를 일으키고,
   * 일치한다면 JWT를 발급합니다.
   * @return JWT와 유저 정보
   * @author 현웅
   */
  @Public()
  @Post("login")
  async login(@Body() body: LoginBodyDto) {
    const userInfo = await this.mongoUserFindService.login(
      body.email,
      body.password,
    );

    const jwt = await this.authService.issueJWT({
      userId: userInfo.user._id,
      userNickname: userInfo.user.nickname,
      userEmail: userInfo.user.email,
    });

    return { jwt, ...userInfo };
  }

  /**
   * 기존에 발급했던 JWT로 로그인합니다.
   * TODO: JWT가 만료되었을 경우 커스텀 메세지 / 혹은 refreshToken 필요
   * @return 새로운 JWT와 유저 정보
   * @author 현웅
   */
  @Post("login/jwt")
  async loginWithJwt(@Request() req: { user: JwtUserInfo }) {
    const userInfo = await this.mongoUserFindService.getUserInfoById(
      req.user.userId,
    );

    const jwt = await this.authService.issueJWT({
      userId: userInfo.user._id,
      userNickname: userInfo.user.nickname,
      userEmail: userInfo.user.email,
    });

    return { jwt, ...userInfo };
  }

  /**
   * 이메일 미인증 유저의 인증 코드를 검증합니다.
   * @author 현웅
   */
  @Public()
  @Post("verify")
  async verifyEmailUser(@Body() body: AuthCodeVerificationBodyDto) {
    //* 입력한 인증 번호가 다르거나
    //* 해당 이메일을 사용하는 유저가 존재하지 않으면 에러를 일으킵니다.
    return await this.mongoUserUpdateService.checkUnauthorizedUserCode({
      email: body.email,
      code: body.code,
    });
  }

  /**
   * refresh 토큰을 받아 Jwt를 발급합니다.
   * @author 현웅
   */
  @Public()
  @Post("refresh")
  async refreshJwt(refreshToken: string) {}
}
