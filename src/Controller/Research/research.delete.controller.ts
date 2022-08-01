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
   * @deprecated
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

  /**
   * 리서치 댓글을 삭제합니다.
   * 해당 댓글에 대댓글이 달려있는 경우, deleted 플래그만 true 로 설정합니다.
   * @author 현웅
   */
  @Delete(":researchId/comments/:commentId")
  async deleteResearchComment(
    @Request() req: { user: JwtUserInfo },
    @Param("researchId") researchId: string,
    @Param("commentId") commentId: string,
  ) {
    const researchSession = await this.researchConnection.startSession();
    await tryMultiTransaction(async () => {
      await this.researchDeleteService.deleteResearchComment(
        { userId: req.user.userId, researchId, commentId },
        researchSession,
      );
    }, [researchSession]);
    return;
  }

  /**
   * 리서치 대댓글을 삭제합니다.
   * 해당 대댓글 이후 또 다른 대댓글이 달려있는 경우, deleted 플래그만 true 로 설정합니다.
   * @author 현웅
   */
  @Delete(":researchId/comments/:commentId/replies/:replyId")
  async deleteResearchReply(
    @Request() req: { user: JwtUserInfo },
    @Param("researchId") researchId: string,
    @Param("commentId") commentId: string,
    @Param("replyId") replyId: string,
  ) {
    const researchSession = await this.researchConnection.startSession();
    await tryMultiTransaction(async () => {
      await this.researchDeleteService.deleteResearchReply(
        { userId: req.user.userId, researchId, commentId, replyId },
        researchSession,
      );
    }, [researchSession]);
    return;
  }
}
