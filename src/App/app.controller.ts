import { Controller, Inject, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { Public } from "src/Security/Metadata";
import { MongoResearchFindService, MongoVoteFindService } from "src/Mongo";

@Controller("")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Inject() private readonly mongoResearchFindService: MongoResearchFindService;
  @Inject() private readonly mongoVoteFindService: MongoVoteFindService;

  /**
   * 배포 시 테스트 URL입니다.
   * @author 현웅
   */
  @Public()
  @Get("release")
  async test() {
    return "2022-08-01 1516 release";
  }

  /**
   * 서버 헬스체크용 경로입니다.
   * @author 현웅
   */
  @Public()
  @Get("health")
  async healthCheck() {
    return await this.appService.healthCheck();
  }

  /**
   * 앱을 처음 시작할 때 호출합니다. 최신 리서치, 투표를 가져옵니다.
   * @author 현웅
   */
  @Public()
  @Get("bootstrap")
  async bootstrap() {
    const getResearches = this.mongoResearchFindService.getRecentResearches();
    const getVotes = this.mongoVoteFindService.getRecentVotes();

    return await Promise.all([getResearches, getVotes]).then(
      ([researches, votes]) => {
        return { researches, votes };
      },
    );
  }
}
