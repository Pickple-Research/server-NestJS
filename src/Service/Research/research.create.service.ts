import { Injectable } from "@nestjs/common";
import { MongoResearchCreateService } from "../../Mongo";
import { ResearchCreateDto } from "../../Dto";

@Injectable()
export class ResearchCreateService {
  constructor(
    private readonly mongoResearchCreateService: MongoResearchCreateService,
  ) {}

  /**
   * @Post
   * 새로운 리서치를 생성합니다.
   * @author 현웅
   */
  async createResearch(researchCreateDto: ResearchCreateDto) {
    return await this.mongoResearchCreateService.createResearch(
      researchCreateDto,
    );
  }
}
