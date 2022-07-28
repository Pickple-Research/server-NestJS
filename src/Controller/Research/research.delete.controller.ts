import { Controller, Request, Param, Headers, Delete } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { ResearchDeleteService } from "src/Service";
import { JwtUserInfo } from "src/Object/Type";
import { tryMultiTransaction } from "src/Util";
import { MONGODB_RESEARCH_CONNECTION } from "src/Constant";

@Controller("researches")
export class ResearchDeleteController {
  constructor(
    private readonly researchDeleteService: ResearchDeleteService,

    @InjectConnection(MONGODB_RESEARCH_CONNECTION)
    private readonly researchConnection: Connection,
  ) {}

  /**
   * !caution: 서버에서 header 데이터를 못 받습니다
   * 리서치를 삭제합니다.
   * @author 현웅
   */
  @Delete("")
  async deleteResearch(
    @Request() req: { user: JwtUserInfo },
    @Headers("research_id") researchId: string,
  ) {
    const researchSession = await this.researchConnection.startSession();
    await tryMultiTransaction(async () => {
      await this.researchDeleteService.deleteResearch(
        { userId: req.user.userId, researchId },
        researchSession,
      );
    }, [researchSession]);
    return;
  }

  /**
   * 리서치를 삭제합니다.
   * @author 현웅
   */
  @Delete(":researchId")
  async deleteResearchWithParam(
    @Request() req: { user: JwtUserInfo },
    @Param() param: { researchId: string },
  ) {
    const researchSession = await this.researchConnection.startSession();
    await tryMultiTransaction(async () => {
      await this.researchDeleteService.deleteResearch(
        { userId: req.user.userId, researchId: param.researchId },
        researchSession,
      );
    }, [researchSession]);
    return;
  }
}
