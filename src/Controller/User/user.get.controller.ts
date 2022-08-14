import { Controller, Inject, Request, Param, Get } from "@nestjs/common";
import { UserFindService } from "src/Service";
import { MongoUserFindService } from "src/Mongo";
import { Public } from "src/Security/Metadata";
import { JwtUserInfo } from "src/Object/Type";

@Controller("users")
export class UserGetController {
  constructor(private readonly userFindService: UserFindService) {}

  @Inject() private readonly mongoUserFindService: MongoUserFindService;

  @Get("credit/newer/:creditHistoryId")
  async getNewerCreditHistories(
    @Request() req: { user: JwtUserInfo },
    @Param("creditHistoryId") creditHistoryId: string,
  ) {
    return await this.mongoUserFindService.getNewerCreditHisories({
      userId: req.user.userId,
      creditHistoryId,
    });
  }

  @Get("credit/older/:creditHistoryId")
  async getOlderCreditHistories(
    @Request() req: { user: JwtUserInfo },
    @Param("creditHistoryId") creditHistoryId: string,
  ) {
    return await this.mongoUserFindService.getOlderCreditHisories({
      userId: req.user.userId,
      creditHistoryId,
    });
  }

  /**
   * 인자로 받은 닉네임을 사용할 수 있는지 확인합니다.
   * 중복된 경우 false, 그렇지 않은 경우 true 를 반환합니다.
   * @author 현웅
   */
  @Public()
  @Get("nickname/:nickname/available")
  async checkNickname(@Param("nickname") nickname: string) {
    const user = await this.mongoUserFindService.getUserByNickname(nickname);
    if (user !== null) return false;
    return true;
  }
}
