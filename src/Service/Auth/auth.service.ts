import { HttpException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Custom403Exception } from "../../Exception";

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async testAuthRouter() {
    throw new Custom403Exception();
  }

  // 로그인
  async login(payload) {
    return {
      token: this.jwtService.sign(payload, { secret: process.env.JWT_SECRET }),
    };
  }

  async issueJWT() {
    return;
  }
}
