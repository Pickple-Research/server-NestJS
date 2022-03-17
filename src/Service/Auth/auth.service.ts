import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserNotFoundException } from "src/Exception";
import { MongoUserService } from "src/Mongo";

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
