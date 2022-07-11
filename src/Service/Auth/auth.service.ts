import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { JwtUserInfo } from "src/Object/Type";
import { getKeccak512Hash } from "src/Util";

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

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
