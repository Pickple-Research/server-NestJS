import { Injectable, Inject } from "@nestjs/common";
import { ClientSession } from "mongoose";
import {
  MongoResearchFindService,
  MongoResearchDeleteService,
} from "src/Mongo";

@Injectable()
export class ResearchDeleteService {
  constructor() {}

  @Inject()
  private readonly mongoResearchFindService: MongoResearchFindService;
  @Inject()
  private readonly mongoResearchDeleteService: MongoResearchDeleteService;

  /**
   * 리서치를 삭제합니다.
   * 이 때, 삭제를 요청한 유저가 작성자가 아닐 경우 에러를 일으킵니다.
   * @author 현웅
   */
  async deleteResearch(
    param: { userId: string; researchId: string },
    session: ClientSession,
  ) {
    //* 리서치 삭제를 요청한 유저가 리서치 작성자인지 여부를 확인합니다.
    const checkIsAuthor = this.mongoResearchFindService.isResearchAuthor({
      userId: param.userId,
      researchId: param.researchId,
    });

    //* 리서치와 관련된 모든 정보를 삭제합니다.
    const deleteResearch = this.mongoResearchDeleteService.deleteResearchById(
      param.researchId,
      session,
    );

    await Promise.all([checkIsAuthor, deleteResearch]);
    return;
  }
}
