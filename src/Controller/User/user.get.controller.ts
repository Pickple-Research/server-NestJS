import { Controller, Inject, Request, Param, Get } from "@nestjs/common";
import { UserFindService } from "src/Service";
import { MongoUserFindService } from "src/Mongo";
import { JwtUserInfo } from "src/Object/Type";

@Controller("users")
export class UserGetController {
  constructor(private readonly userFindService: UserFindService) {}

  @Inject() private readonly mongoUserFindService: MongoUserFindService;

  @Get("credit/:creditHistoryId")
  async getOlderCreditHistories(
    @Request() req: { user: JwtUserInfo },
    @Param("creditHistoryId") creditHistoryId: string,
  ) {
    return await this.mongoUserFindService.getOlderCreditHisories({
      userId: req.user.userId,
      creditHistoryId,
    });
  }
}
