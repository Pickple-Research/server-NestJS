import { Body, Controller, Get, Post } from "@nestjs/common";
import { UserService } from "../../Service";
import { User } from "../../Schema";
import { UserSignupDto } from "../../Dto";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Get Requests
  // 테스트 API
  @Get("")
  async testUserRouter() {
    console.log("testUserRouter function called in user.controller");
    return await this.userService.testUserRouter();
  }

  // Post Requests
  // 회원가입
  @Post("signup")
  async signup(@Body() userSignupDto: UserSignupDto) {
    return await this.userService.signup(userSignupDto);
  }

  // Put Requests
  // Patch Requests
  // Delete Requests
}
