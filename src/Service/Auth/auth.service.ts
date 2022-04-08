import { Injectable, Inject } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { MongoUserFindService } from "../../Mongo";
import { UserSignupDto } from "../../Dto";
import { UserNotFoundException } from "../../Exception";

@Injectable()
export class AuthService {
  constructor() {}

  @Inject() private readonly mongoUserFindService: MongoUserFindService;
  @Inject() private readonly jwtService: JwtService;

  /**
   * @Get
   * 테스트 라우터
   * @author 현웅
   */
  async testAuthRouter() {
    // throw new UserNotFoundException();
    return this.mongoUserFindService.getUserByEmail("dennis2311@yonsei.ac.kr");
  }

  /**
   * @Post
   * userSignupDto 형태의 인자를 받아 로그인합니다.
   * ***
   * 프로세스는 다음과 같습니다:
   * 1. MongoDB를 조회하여 유저 정보를 탐색합니다.
   *    - 유저가 없는 경우 UserNotFoundException
   *    - 비밀번호가 일치하지 않는 경우 //TODO:
   * 2. userEmail, userType, kakaoId/googleId/facebookId 를 포함한 jwt 토큰을 만듭니다.
   * 3. jwt 토큰은 header에 담고, 유저 정보는 body에 담아 반환합니다.
   * @author 현웅
   */
  async login(userSignupDto: UserSignupDto) {
    return {
      token: this.jwtService.sign(userSignupDto, {
        secret: process.env.JWT_SECRET,
        //TODO: Jwt 만료시간 설정하고 만료된 경우 Access Token으로 갱신 요청 (jwtAuth.strategy.ts 참조)
        // expiresIn: "14d",
      }),
    };
  }

  async issueJWT() {
    return;
  }

  /**
   * @Post
   * userSignupDto 형태의 인자를 받아 회원가입합니다.
   * @author 현웅
   */
  async signup(userSignupDto: UserSignupDto) {
    return "auth.service: signup()";
  }
}
