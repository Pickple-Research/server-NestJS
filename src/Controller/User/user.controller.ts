import {
  Controller,
  Headers,
  Body,
  Get,
  Post,
  Patch,
  Put,
  Delete,
} from "@nestjs/common";
import { UserService } from "../../Service";
import { UserSignupDto } from "../../Dto";
import { Public } from "../../Security/Metadata";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Get Requests
  /**
   * 테스트 라우터
   * @author 현웅
   */
  @Public()
  @Get("")
  async testUserRouter() {
    return await this.userService.testUserRouter();
  }

  // Post Requests
  /**
   * userSignupDto 형태의 인자를 받아 회원가입 합니다.
   * @author 현웅
   */
  @Public()
  @Post("signup")
  async signup(@Body() userSignupDto: UserSignupDto) {
    return await this.userService.signup(userSignupDto);
  }

  @Public()
  @Post("create")
  async create() {
    return await this.userService.create();
  }

  // Patch Requests

  // Put Requests

  // Delete Requests
}
