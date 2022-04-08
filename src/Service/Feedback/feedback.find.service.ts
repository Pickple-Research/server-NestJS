import { Injectable } from "@nestjs/common";
import { MongoFeedbackFindService } from "../../Mongo";

@Injectable()
export class FeedbackFindService {
  constructor(
    private readonly mongoFeedbackFindService: MongoFeedbackFindService,
  ) {}

  /**
   * @Get
   * 테스트 라우터
   * @author 현웅
   */
  async testFeedbackRouter() {
    return "testFeedbackRouter";
  }
}
