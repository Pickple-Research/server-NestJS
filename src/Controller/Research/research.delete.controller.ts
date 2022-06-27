import { Controller, Inject, Request, Headers, Delete } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import {
  MongoUserUpdateService,
  MongoResearchFindService,
  MongoResearchDeleteService,
} from "src/Mongo";
import { JwtUserInfo } from "src/Object/Type";
import { tryMultiTransaction } from "src/Util";
import {
  MONGODB_USER_CONNECTION,
  MONGODB_RESEARCH_CONNECTION,
} from "src/Constant";

@Controller("researches")
export class ResearchDeleteController {
  constructor(
    @InjectConnection(MONGODB_USER_CONNECTION)
    private readonly userConnection: Connection,
    @InjectConnection(MONGODB_RESEARCH_CONNECTION)
    private readonly researchConnection: Connection,
  ) {}

  @Inject()
  private readonly mongoUserUpdateService: MongoUserUpdateService;
  @Inject()
  private readonly mongoResearchFindService: MongoResearchFindService;
  @Inject()
  private readonly mongoResearchDeleteService: MongoResearchDeleteService;

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
      //* 리서치 삭제를 요청한 유저가 리서치 작성자인지 여부를 확인합니다.
      const checkIsAuthor =
        await this.mongoResearchFindService.isResearchAuthor({
          userId: req.user.userId,
          researchId,
        });

      //* 유저 리서치 정보 중 업로드한 리서치 _id 를 제거합니다.
      const updateUserResearch =
        await this.mongoUserUpdateService.deleteUploadedResearch(
          {
            userId: req.user.userId,
            researchId,
          },
          userSession,
        );

      //* 리서치와 관련된 모든 정보를 삭제합니다.
      const deleteResearch =
        await this.mongoResearchDeleteService.deleteResearchById(
          researchId,
          researchSession,
        );

      //* 위 세 개 작업을 동시에 수행합니다.
      await Promise.all([checkIsAuthor, updateUserResearch, deleteResearch]);
    }, [userSession, researchSession]);

    return;
  }
}
