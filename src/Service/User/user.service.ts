import { Injectable } from "@nestjs/common";
import { UserSignupDto } from "../../Dto";
import { MongoUserService } from "../../Mongo/mongo.user.service";
// libraries
import bcrypt from "bcrypt";

@Injectable()
export class UserService {
  constructor(private readonly mongoUserService: MongoUserService) {}

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
  // Put Requests
  // Patch Requests
  // Delete Requests
}
