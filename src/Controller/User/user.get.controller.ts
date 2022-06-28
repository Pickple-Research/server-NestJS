import { Controller, Get } from "@nestjs/common";
import { UserFindService } from "src/Service";
import { Public } from "src/Security/Metadata";

@Controller("users")
export class UserGetController {
  constructor(private readonly userFindService: UserFindService) {}

  @Public()
  @Get()
  async getUser() {}
}
