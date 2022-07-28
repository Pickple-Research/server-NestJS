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
   * 리서치를 삭제합니다.
   * @author 현웅
   */
  @Delete("")
  async deleteResearch(
    @Request() req: { user: JwtUserInfo },
    @Headers() header: { research_id: string },
  ) {
    console.log(`header:`);
    console.dir(header);
    const researchSession = await this.researchConnection.startSession();
    await tryMultiTransaction(async () => {
      await this.researchDeleteService.deleteResearch(
        {
          userId: req.user.userId,
          researchId: header.research_id.toString().trim(),
        },
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
    console.log(`ongoing delete researchId: ${param.researchId}`);
    console.log(`type: ${typeof param.researchId}`);
    const researchSession = await this.researchConnection.startSession();
    await tryMultiTransaction(async () => {
      await this.researchDeleteService.deleteResearch(
        {
          userId: req.user.userId,
          researchId: param.researchId,
        },
        researchSession,
      );
    }, [researchSession]);
    return;
  }
}
