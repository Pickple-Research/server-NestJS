import { Injectable, Inject } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { MongoUserFindService, MongoUserDeleteService } from "../Mongo";

/**
 * 주기적으로 실행되는 CronJob들을 정의합니다.
 * @author 현웅
 */
@Injectable()
export class CronService {
  // constructor(
  //   private readonly mongoUserFindService: MongoUserFindService,
  //   private readonly mongoUserDeleteService: MongoUserDeleteService,
  // ) {}

  @Inject(MongoUserFindService)
  private readonly mongoUserFindService: MongoUserFindService;
  @Inject(MongoUserDeleteService)
  private readonly mongoUserDeleteService: MongoUserDeleteService;

  //
  // CronJob 시간 읽는 법:
  //
  // @Cron('* * * * * *')
  //        | | | | | |
  //        | | | | | day of week (요일. 1~7의 값)
  //        | | | | months
  //        | | | day of month
  //        | | hours
  //        | minutes
  //        seconds
  //
  // @example
  // @Cron('5 * * * * *')  // 매 분 5초마다
  // @Cron('5/* * * * *')  // 매 5초마다
  // @Cron('0 10 * * * *')  // 매 시 10분 마다
  // @Cron('0 */30 9-17 * * *')  // 9시~17시에, 30분마다
  // @Cron('0 30 11 * * 1-5')  // 월요일부터 금요일까지, 11시 30분마다
  //
  // 참고: https://docs.nestjs.com/techniques/task-scheduling
  //

  /**
   * 생성된지 일주일이 지난 미인증 유저 데이터를 삭제합니다.
   * @author 현웅
   */
  @Cron("0 0 10 * * *", { timeZone: "Asia/Seoul" }) // 매일 10시마다
  async deleteWeekPassedUnauthorizedUser() {
    // const weekPassedUnauthorizedUsers = this.mongoUserFindService.getWeekPassedUnauthorizedUsers()
    // weekPassedUnauthorizedUsers.forEach(user=>{
    //   this.mongoUserDeleteService.deleteUnauthorizedUser(user.email);
    // })
    await this.mongoUserDeleteService.deleteUnauthorizedUser("");
    return;
  }
}
