import { Injectable } from "@nestjs/common";
import { MongoResearchFindService } from "../../Mongo";
import { ResearchNotFoundException } from "../../Exception";

@Injectable()
export class ResearchFindService {
  constructor(
    private readonly mongoResearchFindService: MongoResearchFindService,
  ) {}

  /**
   * @Get
   * 테스트 라우터
   * @author 현웅
   */
  async testResearchRouter() {
    return "testResearchRouter";
  }

  /**
   * @Get
   * 최신 리서치를 원하는만큼 찾고 반환합니다.
   * get 인자가 주어지지 않은 경우 기본적으로 20개를 반환합니다.
   * @author 현웅
   */
  async getRecentResearches(get: number = 20) {
    return await this.mongoResearchFindService.getRecentResearches(get);
  }

  /**
   * @Get
   * _id를 이용해 리서치를 찾고 반환합니다.
   * mongoResearchService를 이용해 가져온 결과가 없다면 exception을 일으킵니다.
   * @author 현웅
   */
  async getResearchById(researchId: string) {
    const research = await this.mongoResearchFindService.getResearchById(
      researchId,
    );
    if (research) return research;
    else throw new ResearchNotFoundException();
  }
}
