import { Controller, Inject, Query, Param, Get } from "@nestjs/common";
import { MongoResearchFindService } from "src/Mongo";
import { Public } from "src/Security/Metadata";
import { ResearchNotFoundException } from "src/Exception";

@Controller("researches")
export class ResearchGetController {
  constructor() {}

  @Inject() private readonly mongoResearchFindService: MongoResearchFindService;

  /**
   * 테스트 라우터
   * @author 현웅
   */
  @Get("test")
  @Public()
  async testResearchRouter() {
    return "test Research Router()";
  }

  /**
   * 최신 리서치를 원하는만큼 찾고 반환합니다.
   * get 인자가 주어지지 않은 경우 기본적으로 20개를 반환합니다.
   * @author 현웅
   */
  @Get("")
  @Public()
  async getRecentResearches(@Query() query: { get?: number }) {
    return await this.mongoResearchFindService.getRecentResearches(query?.get);
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
  async getResearchById(@Param("researchId") researchId: string) {
    const [research, researchParticipation] =
      await this.mongoResearchFindService.getResearchById(researchId);

    //* 리서치 정보가 존재하지 않는 경우, 에러를 일으킵니다.
    if (research === null || researchParticipation === null) {
      throw new ResearchNotFoundException();
    }

    return { research, researchParticipation };
  }
}
