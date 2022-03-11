import {
  Request,
  Body,
  Controller,
  Get,
  Post,
  UseFilters,
  UseGuards,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { UserService } from "../../Service";
import { User } from "../../Schema";
import { UserSignupDto } from "../../Dto";
import { httpExceptionFilter } from "../../Exception/Filter";
import { JWTAuthGuard, LocalAuthGuard } from "../../Security/Guard";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Get Requests
  // 테스트 API
  @Get("")
  @UseFilters(httpExceptionFilter)
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

  // 로그인
  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(@Request() req) {
    const payload = { email: req.email };
    return this.userService.login(payload);
  }

  // Put Requests

  // @Put("logout")
  // @Get("personalinfo")
  // @Put("personalinfo")
  // @Put("api/users/confirmemail")
  // @Put("api/users/confirmemailpassword")
  // @Put("api/users/changepassword")
  // @Get("api/users/checkPassword")
  // @Put("api/users/allownotifications")
  // @Put("api/users/disallownotifications")
  // @Put("api/user/myparticipate")
  // @Put("api/users/blockuser")
  // @Get("userids/duplicate")
  // @Get("names/duplicate")
  // @Get("phonenumbers/duplicate")
  // @Get("api/users/finduserid")
}
