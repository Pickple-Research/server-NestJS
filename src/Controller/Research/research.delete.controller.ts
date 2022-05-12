import { Controller, Headers, Delete } from "@nestjs/common";
import { ResearchDeleteService } from "src/Service";

@Controller("researches")
export class ResearchDeleteController {
  constructor(private readonly researchDeleteService: ResearchDeleteService) {}

  /**
   * 리서치를 삭제합니다.
   * @author 현웅
   */
  @Delete("")
  async deleteResearch(@Headers() headers: { research_id: string }) {
    return await this.researchDeleteService.deleteResearch(headers.research_id);
  }
}
