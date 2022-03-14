import { Controller, Get, Post, Request, UseGuards } from "@nestjs/common";
import { AuthService } from "../../Service";
import { LocalAuthGuard } from "../../Security";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("")
  async testAuthRouter() {
    return this.authService.testAuthRouter();
  }

  // 로그인
  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(@Request() req) {
    const payload = { email: req.email };
    return this.authService.login(payload);
  }
}
