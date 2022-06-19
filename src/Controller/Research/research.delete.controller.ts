import { Controller, Inject, Request, Headers, Delete } from "@nestjs/common";
import {
  MongoResearchFindService,
  MongoResearchDeleteService,
} from "src/Mongo";
import { JwtUserInfo } from "src/Object/Type";

@Controller("researches")
export class ResearchDeleteController {
  constructor() {}

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
    @Headers("research_id") research_id: string,
  ) {
    //* 리서치 삭제를 요청한 유저가 리서치 작성자인지 여부를 확인합니다.
    const checkIsAuthor = await this.mongoResearchFindService.isResearchAuthor({
      userId: req.user.userId,
      researchId: research_id,
    });
    //* 리서치를 삭제합니다. (실제 삭제는 아니고 deleted 플래그만 true로 설정합니다.)
    //* 댓글, 대댓글을 모두 삭제합니다.
    const deleteResearch =
      await this.mongoResearchDeleteService.deleteResearchById(research_id);

    await Promise.all([checkIsAuthor, deleteResearch]);
    return;
  }
}
