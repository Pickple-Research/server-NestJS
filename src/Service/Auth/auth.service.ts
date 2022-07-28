import { Injectable, Inject } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { MongoUserFindService } from "src/Mongo";
import { JwtUserInfo } from "src/Object/Type";
import { getKeccak512Hash } from "src/Util";
import { UserNotFoundException, WrongPasswordException } from "src/Exception";

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  @Inject() private readonly mongoUserFindService: MongoUserFindService;

  /**
   * 주어진 이메일과 비밀번호를 사용해 로그인이 가능한지 확인합니다.
   * 해당 이메일을 사용하는 유저가 없는 경우,
   * 혹은 비밀번호가 다른 경우 오류를 일으킵니다.
   * @param email
   * @param password
   * @author 현웅
   */
  async authenticate(email: string, password: string) {
    //* UserSecurity 정보 조회
    const userSecurity = await this.mongoUserFindService.getUserSecurityByEmail(
      email,
    );

    //* 주어진 비밀번호 해쉬
    const hashedPassword = await this.getHashPassword(
      password,
      userSecurity.salt,
    );

    //* 비밀번호가 일치하지 않는 경우
    if (hashedPassword !== userSecurity.password)
      throw new WrongPasswordException();
    return;
  }

  /**
   * 유저 기본 정보를 Jwt로 만들어 반환합니다.
   * @author 현웅
   */
  async issueJWT(userInfo: JwtUserInfo) {
    return this.jwtService.sign(userInfo, {
      secret: process.env.JWT_SECRET,
      expiresIn: "14d",
    });
  }

  /**
   * 주어진 비밀번호와 salt 를 이용해 암호화된 비밀번호를 반환합니다.
   * @author 현웅
   */
  async getHashPassword(password: string, salt: string) {
    return getKeccak512Hash(password + salt, parseInt(process.env.PEPPER));
  }
}
