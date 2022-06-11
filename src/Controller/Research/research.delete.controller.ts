import { Controller, Inject, Headers, Delete } from "@nestjs/common";
import { MongoResearchDeleteService } from "src/Mongo";

@Controller("researches")
export class ResearchDeleteController {
  constructor() {}

  @Inject()
  private readonly mongoResearchDeleteService: MongoResearchDeleteService;

  /**
   * 리서치를 삭제합니다.
   * @author 현웅
   */
  @Delete("")
  async deleteResearch(@Headers("research_id") research_id: string) {
    return await this.mongoResearchDeleteService.deleteResearchById(
      research_id,
    );
  }
}
