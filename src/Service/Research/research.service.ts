import { Injectable } from "@nestjs/common";
import { MongoResearchService } from "../../Mongo";
import { ResearchCreateDto } from "../../Dto";
import { ResearchNotFoundException } from "../../Exception";

@Injectable()
export class ResearchService {
  constructor(private readonly mongoResearchService: MongoResearchService) {}

  // Get Requests
  /**
   * 테스트 라우터
   * @author 현웅
   */
  async testResearchRouter() {
    return "testResearchRouter";
  }

  /**
   * 최신 리서치를 원하는만큼 찾고 반환합니다.
   * get 인자가 주어지지 않은 경우 기본적으로 20개를 반환합니다.
   * @author 현웅
   */
  async getRecentResearches(get: number = 20) {
    return await this.mongoResearchService.getRecentResearches(get);
  }

  /**
   * _id를 이용해 리서치를 찾고 반환합니다.
   * mongoResearchService를 이용해 가져온 결과가 없다면 exception을 일으킵니다.
   * @author 현웅
   */
  async getResearchById(researchId: string) {
    const research = await this.mongoResearchService.getResearchById(
      researchId,
    );
    if (research) return research;
    else throw new ResearchNotFoundException();
  }

  // Post Requests
  /**
   * 새로운 리서치를 생성합니다.
   * @author 현웅
   */
  async createResearch(researchCreateDto: ResearchCreateDto) {
    return await this.mongoResearchService.createResearch(researchCreateDto);
  }

  // Patch Requests

  // Put Requests

  // Delete Requests
}
