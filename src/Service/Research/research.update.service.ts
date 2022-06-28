import { Injectable, Inject } from "@nestjs/common";
import { MongoResearchUpdateService } from "src/Mongo";

/**
 * 리서치 관련 데이터가 수정되는 경우
 * @author 현웅
 */
@Injectable()
export class ResearchUpdateService {
  constructor() {}

  @Inject()
  private readonly mongoResearchUpdateService: MongoResearchUpdateService;
}
