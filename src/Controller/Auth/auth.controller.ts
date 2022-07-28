import { Controller, Inject, Request, Body, Post } from "@nestjs/common";
import { AuthService, UserFindService } from "src/Service";
import {
  MongoUserFindService,
  MongoUserUpdateService,
  MongoSurBayService,
} from "src/Mongo";
import { Public } from "src/Security/Metadata";
import { LoginBodyDto, AuthCodeVerificationBodyDto } from "src/Dto";
import { JwtUserInfo } from "src/Object/Type";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userFindService: UserFindService,
  ) {}

  @Inject() private readonly mongoUserFindService: MongoUserFindService;
  @Inject() private readonly mongoUserUpdateService: MongoUserUpdateService;
  @Inject() private readonly mongoSurBayService: MongoSurBayService;

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
    //* 이메일과 비밀번호가 유효한지 확인
    const authenticate = this.authService.authenticate(
      body.email,
      body.password,
    );
    //* UserPrivacy, UserSecurity 를 제외한 정보 반환
    const getUserInfo = this.mongoUserFindService.getUserInfoByEmail(
      body.email,
    );
    //* 위 두 함수를 동시에 실행
    const userInfo = await Promise.all([authenticate, getUserInfo]).then(
      ([_, userInfo]) => {
        return userInfo;
      },
    );

    //* UserInfo 를 바탕으로 유저가 조회/스크랩/참여/업로드한 리서치, 투표 정보 반환
    const userActivities = await this.userFindService.getUserActivities({
      userId: userInfo.user._id,
      userResearch: userInfo.userResearch,
      userVote: userInfo.userVote,
    });

    //* JWT 새로 발급
    const jwt = await this.authService.issueJWT({
      userId: userInfo.user._id,
      userNickname: userInfo.user.nickname,
      userEmail: userInfo.user.email,
    });

    //* 가져온 정보를 모두 반환
    return { jwt, userInfo, userActivities };
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
   * SurBay DB 데이터를 통해 로그인합니다.
   * @author 현웅
   */
  @Public()
  @Post("login/surbay")
  async surBayLogin(@Body() body: LoginBodyDto) {
    return await this.mongoSurBayService.surBayLogin({
      email: body.email,
      password: body.password,
    });
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
