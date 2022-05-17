import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Research, ResearchDocument } from "../../Schema";

@Injectable()
export class MongoResearchFindService {
  constructor(
    @InjectModel(Research.name)
    private readonly Research: Model<ResearchDocument>,
  ) {}

  async testMongoResearchRouter() {
    return "test mongoResearchFindRouter";
  }

  /**
   * 최신 리서치를 원하는만큼 찾고 반환합니다.
   * @author 현웅
   */
  async getRecentResearches(get: number) {
    return await this.Research.find()
      .sort({ _id: -1 }) // 최신순 정렬 후 (mongodb의 _id가 생성일자 정보를 포함하기에 가능한 방식)
      .limit(get) // 원하는 수만큼
      // .select({})  //TODO: 원하는 property만
      .lean(); // data만 뽑아서 반환
  }

  /**
   * 주어진 리서치 _id를 기준으로 하여 과거의 리서치 10개를 찾고 반환합니다.
   * TODO: 검증해볼 것
   * @author 현웅
   */
  async getPaginatedResearches(researchId: string) {
    return await this.Research.find({
      _id: { $gt: researchId }, // 주어진 research의 _id 보다 과거의 _id를 가진 research 중에서
    })
      .sort({ _id: -1 }) // 최신순 정렬 후
      .limit(10) // 10개를 가져오고
      .lean(); // data만 뽑아서 반환
  }

  /**
   * 주어진 _id를 통해 리서치를 찾고 반환합니다.
   * @author 현웅
   */
  async getResearchById(researchId: string) {
    return await this.Research.findOne({ _id: researchId }).lean();
  }
}
