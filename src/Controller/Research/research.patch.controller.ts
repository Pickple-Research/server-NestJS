import { Controller, Inject, Body, Patch, Param } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { MongoResearchUpdateService } from "src/Mongo";
import { MONGODB_RESEARCH_CONNECTION } from "src/Constant";

/**
 * 리서치 데이터에 대한 Patch 메소드 요청을 관리합니다.
 * @author 현웅
 */
@Controller("researches")
export class ResearchPatchController {
  constructor(
    @InjectConnection(MONGODB_RESEARCH_CONNECTION)
    private readonly connection: Connection,
  ) {}

  @Inject()
  private readonly mongoResearchUpdateService: MongoResearchUpdateService;

  @Patch("")
  async updateResearch() {}

  /**
   * 리서치를 연장합니다.
   * @author 현웅
   */
  @Patch("extend/:researchId")
  async extendResearch(@Param() param: { researchId: string }) {
    return await this.mongoResearchUpdateService.extendResearch(
      param.researchId,
    );
  }

  /**
   * 리서치를 종료합니다.
   * @author 현웅
   */
  @Patch("close/:researchId")
  async closeResearch(@Param() param: { researchId: string }) {
    return await this.mongoResearchUpdateService.closeResearch(
      param.researchId,
    );
  }
}
