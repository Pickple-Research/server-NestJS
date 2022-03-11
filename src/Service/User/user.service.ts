import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserSignupDto } from "../../Dto";
import { MongoUserService } from "../Mongo/mongo.user.service";
// libraries
import bcrypt from "bcrypt";

@Injectable()
export class UserService {
  constructor(
    private readonly mongoUserService: MongoUserService,
    private readonly jwtService: JwtService,
  ) {}

  // Get Requests
  async testUserRouter() {
    console.log("testUserRouter function called in user.service");
    return "user.service";
  }

  // Post Requests
  // 회원가입
  async signup(userSignupDto: UserSignupDto) {
    return;
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
