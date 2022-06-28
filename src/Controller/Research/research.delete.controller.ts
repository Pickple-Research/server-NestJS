import { Controller, Inject, Request, Headers, Delete } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { ResearchDeleteService } from "src/Service";
import { MongoUserUpdateService } from "src/Mongo";
import { JwtUserInfo } from "src/Object/Type";
import { tryMultiTransaction } from "src/Util";
import {
  MONGODB_USER_CONNECTION,
  MONGODB_RESEARCH_CONNECTION,
} from "src/Constant";

@Controller("researches")
export class ResearchDeleteController {
  constructor(
    private readonly researchDeleteService: ResearchDeleteService,

    @InjectConnection(MONGODB_USER_CONNECTION)
    private readonly userConnection: Connection,
    @InjectConnection(MONGODB_RESEARCH_CONNECTION)
    private readonly researchConnection: Connection,
  ) {}

  @Inject()
  private readonly mongoUserUpdateService: MongoUserUpdateService;

  /**
   * 리서치를 삭제합니다.
   * @author 현웅
   */
  @Delete("")
  async deleteResearch(
    @Request() req: { user: JwtUserInfo },
    @Headers("research_id") researchId: string,
  ) {
    const userSession = await this.userConnection.startSession();
    const researchSession = await this.researchConnection.startSession();

    await tryMultiTransaction(async () => {
      //* 유저 리서치 정보 중 업로드한 리서치 _id 를 제거합니다.
      const updateUserResearch =
        await this.mongoUserUpdateService.deleteUploadedResearch(
          {
            userId: req.user.userId,
            researchId,
          },
          userSession,
        );

      //* 리서치 정보를 삭제합니다.
      const deleteResearch = await this.researchDeleteService.deleteResearch(
        {
          userId: req.user.userId,
          researchId,
        },
        researchSession,
      );

      //* 위 두 개 작업을 동시에 수행합니다.
      await Promise.all([updateUserResearch, deleteResearch]);
    }, [userSession, researchSession]);

    return;
  }
}
