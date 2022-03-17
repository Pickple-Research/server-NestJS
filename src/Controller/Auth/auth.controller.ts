import { Controller, Get, Post, Body, ValidationPipe } from "@nestjs/common";
import { AuthService } from "../../Service";
import { UserSignupDto } from "src/Dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("")
  async testAuthRouter() {
    return this.authService.testAuthRouter();
  }

  // 로그인
  @Post("login")
  async login(@Body() userSignupDto: UserSignupDto) {
    return userSignupDto;
  }
}
