import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserNotFoundException } from "src/Exception";
import { MongoUserService } from "src/Mongo";
import { UserSignupDto } from "src/Dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly mongoUserService: MongoUserService,
    private readonly jwtService: JwtService,
  ) {}

  async testAuthRouter() {
    // throw new UserNotFoundException();
    return this.mongoUserService.getUserByEmail("dennis2311@yonsei.ac.kr");
  }

  /**
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
}
