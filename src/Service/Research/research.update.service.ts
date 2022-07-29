import { Injectable, Inject } from "@nestjs/common";
import { ClientSession } from "mongoose";
import {
  MongoResearchFindService,
  MongoResearchUpdateService,
} from "src/Mongo";
import { Research } from "src/Schema";

/**
 * 리서치 관련 데이터가 수정되는 경우
 * @author 현웅
 */
@Injectable()
export class ResearchUpdateService {
  constructor() {}

  @Inject()
  private readonly mongoResearchFindService: MongoResearchFindService;
  @Inject()
  private readonly mongoResearchUpdateService: MongoResearchUpdateService;

  /**
   * @Transaction
   * 리서치를 수정합니다.
   * 이 때, 리서치 수정을 요청한 유저가 리서치 작성자가 아닌 경우 에러를 일으킵니다.
   * @return 수정된 리서치 정보
   * @author 현웅
   */
  async updateResearch(
    param: {
      userId: string;
      researchId: string;
      research: Partial<Research>;
    },
    session: ClientSession,
  ) {
    //* 리서치 수정을 요청한 유저가 리서치 작성자인지 확인
    const checkIsAuthor = this.mongoResearchFindService.isResearchAuthor({
      userId: param.userId,
      researchId: param.researchId,
    });
    //* 리서치 내용을 수정
    const updateResearch = this.mongoResearchUpdateService.updateResearch(
      { researchId: param.researchId, research: param.research },
      session,
    );
    //* 위 두 함수를 동시에 실행하고 수정된 리서치 정보를 반환
    return await Promise.all([checkIsAuthor, updateResearch]).then(
      ([_, updatedResearch]) => {
        return updatedResearch;
      },
    );
  }
}
