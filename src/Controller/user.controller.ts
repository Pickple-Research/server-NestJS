import { Body, Controller, Get, Post } from "@nestjs/common";
import { UserService } from "../Service";
import { User } from "../Schema";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("signup")
  async create() {
    await this.userService.signup();
  }

  @Post("login")
  async findAll() {
    return this.userService.login();
  }

  @Get("")
  async allUser() {
    return await this.userService.allUser();
  }
}
