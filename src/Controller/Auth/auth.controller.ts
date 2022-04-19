import { Controller, Body, Get, Post } from "@nestjs/common";
import { AuthService } from "../../Service";
import { UserSignupDto } from "../../Dto";
import { Public } from "../../Security/Metadata";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 테스트 라우터
   * @author 현웅
   */
  @Public()
  @Get("test")
  async testAuthRouter() {
    return this.authService.testAuthRouter();
  }

  /**
   * userSignupDto 형태의 인자를 받아 로그인합니다.
   * @author 현웅
   */
  @Public()
  @Post("login")
  async login(@Body() userSignupDto: UserSignupDto) {
    return this.authService.login(userSignupDto);
  }

  /**
   * userSignupDto 형태의 인자를 받아 회원가입합니다.
   * @author 현웅
   */
  @Public()
  @Post("signup")
  async signup(@Body() userSignupDto: UserSignupDto) {
    return this.authService.signup(userSignupDto);
  }
}
