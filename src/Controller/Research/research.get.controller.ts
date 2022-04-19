import { Controller, Query, Param, Get } from "@nestjs/common";
import { ResearchFindService } from "../../Service";
import { Public } from "../../Security/Metadata";

@Controller("researches")
export class ResearchGetController {
  constructor(private readonly researchFindService: ResearchFindService) {}

  /**
   * 테스트 라우터
   * @author 현웅
   */
  @Get("test")
  @Public()
  async testResearchRouter() {
    return await this.researchFindService.testResearchRouter();
  }

  /**
   * 최신 리서치를 원하는만큼 찾고 반환합니다.
   * get 인자가 주어지지 않은 경우 기본적으로 20개를 반환합니다.
   * @author 현웅
   */
  @Get("")
  @Public()
  async getRecentResearches(@Query() query: { get?: number }) {
    return await this.researchFindService.getRecentResearches(query?.get);
  }

  /**
   * 주어진 리서치 _id를 기준으로 하여 과거의 리서치 10개를 찾고 반환합니다.
   * TODO: 경로 이름을 뭘로 할까
   * @author 현웅
   */
  @Get()
  @Public()
  async getPaginatedResearches() {
    return;
  }

  /**
   * _id로 특정 리서치를 찾고 반환합니다.
   * 존재하지 않는 경우 exception을 일으킵니다.
   * @author 현웅
   */
  @Get(":researchId")
  @Public()
  async getResearchById(@Param() param: { researchId: string }) {
    return this.researchFindService.getResearchById(param.researchId);
  }
}