import { Injectable, Inject } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { SchedulerRegistry } from "@nestjs/schedule";
import { Connection, ClientSession } from "mongoose";
import { CronJob } from "cron";
import { FirebaseService } from "src/Firebase";
import { TokenMessage } from "firebase-admin/lib/messaging/messaging-api";
import {
  MongoUserFindService,
  MongoUserCreateService,
  MongoResearchFindService,
  MongoResearchCreateService,
  MongoResearchUpdateService,
  MongoResearchDeleteService,
} from "src/Mongo";
import {
  User,
  Research,
  ResearchView,
  ResearchScrap,
  ResearchParticipation,
  CreditHistory,
} from "src/Schema";
import { CreditHistoryType } from "src/Object/Enum";
import { tryMultiTransaction, getCurrentISOTime } from "src/Util";
import {
  MONGODB_USER_CONNECTION,
  MONGODB_RESEARCH_CONNECTION,
  RESEARCH_AUTO_CLOSE_CRONJOB_NAME,
  WIN_EXTRA_CREDIT_ALARM_TITLE,
  WIN_EXTRA_CREDIT_ALARM_CONTENT,
} from "src/Constant";

/**
 * 리서치 관련 데이터가 수정되는 경우
 * @author 현웅
 */
@Injectable()
export class ResearchUpdateService {
  constructor(
    @InjectConnection(MONGODB_USER_CONNECTION)
    private readonly userConnection: Connection,
    @InjectConnection(MONGODB_RESEARCH_CONNECTION)
    private readonly researchConnection: Connection,

    private readonly firebaseService: FirebaseService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  @Inject()
  private readonly mongoUserFindService: MongoUserFindService;
  @Inject()
  private readonly mongoUserCreateService: MongoUserCreateService;
  @Inject()
  private readonly mongoResearchFindService: MongoResearchFindService;
  @Inject()
  private readonly mongoResearchCreateService: MongoResearchCreateService;
  @Inject()
  private readonly mongoResearchUpdateService: MongoResearchUpdateService;
  @Inject()
  private readonly mongoResearchDeleteService: MongoResearchDeleteService;

  /**
   * 리서치를 조회합니다.
   * 유저가 이미 리서치를 조회한 적이 있는지 확인하고 조회한 적이 없다면
   * 새로운 리서치 조회 정보를 생성하고 리서치 조회수를 1 증가시킵니다.
   * @return 새로 생성된 리서치 조회 정보 | null
   * @author 현웅
   */
  async viewResearch(param: { researchView: ResearchView }) {
    if (
      await this.mongoResearchFindService.isUserAlreadyViewedResearch({
        userId: param.researchView.userId,
        researchId: param.researchView.researchId,
      })
    ) {
      return null;
    }

    await this.mongoResearchUpdateService.updateView({
      researchId: param.researchView.researchId,
    });

    return await this.mongoResearchCreateService.createResearchView({
      researchView: param.researchView,
    });
  }

  /**
   * 리서치를 스크랩합니다.
   * 리서치 스크랩 수를 증가시키고 새로운 리서치 스크랩 정보를 생성합니다.
   * @return 업데이트된 리서치 정보, 생성된 리서치 스크랩 정보
   * @author 현웅
   */
  async scrapResearch(param: {
    researchId: string;
    researchScrap: ResearchScrap;
  }) {
    //* 리서치 스크랩 수 증가
    const updateResearch = this.mongoResearchUpdateService.updateScrap({
      researchId: param.researchId,
      unscrap: false,
    });
    //* 리서치 스크랩 정보 생성
    const createResearchScrap =
      this.mongoResearchCreateService.createResearchScrap({
        researchScrap: param.researchScrap,
      });
    //* 두 함수 동시 실행
    return await Promise.all([updateResearch, createResearchScrap]).then(
      ([updatedResearch, newResearchScrap]) => {
        return { updatedResearch, newResearchScrap };
      },
    );
  }

  /**
   * 리서치 스크랩을 취소합니다.
   * 리서치 스크랩 수를 감소시키고 리서치 스크랩 정보를 삭제합니다.
   * @return 업데이트된 리서치 정보
   * @author 현웅
   */
  async unscrapResearch(param: { userId: string; researchId: string }) {
    //* 리서치 스크랩 수 감소
    const updateResearch = this.mongoResearchUpdateService.updateScrap({
      researchId: param.researchId,
      unscrap: true,
    });
    //* 리서치 스크랩 정보 삭제
    const deleteResearchScrap =
      this.mongoResearchDeleteService.deleteResearchScrap({
        userId: param.userId,
        researchId: param.researchId,
      });
    //* 두 함수 동시 실행
    return await Promise.all([updateResearch, deleteResearchScrap]).then(
      ([updatedResearch, _]) => {
        return updatedResearch;
      },
    );
  }

  /**
   * 리서치에 참여합니다.
   * 리서치 참여자 수를 증가시키고 리서치 참여 정보를 생성합니다.
   * @return 업데이트된 리서치 정보, 생성된 리서치 참여 정보
   * @author 현웅
   */
  async participateResearch(
    param: { researchId: string; researchParticipation: ResearchParticipation },
    session: ClientSession,
  ) {
    //* 유저가 이미 리서치에 참여했었는지 확인
    const checkAlreadyParticipated =
      this.mongoResearchFindService.isUserAlreadyParticipatedResearch({
        userId: param.researchParticipation.userId,
        researchId: param.researchId,
      });
    //* 리서치 참여자 수 1 증가
    const updateResearch = this.mongoResearchUpdateService.updateParticipant(
      { researchId: param.researchId },
      session,
    );
    //* 위 두 함수를 동시에 실행
    const updatedResearch = await Promise.all([
      checkAlreadyParticipated,
      updateResearch,
    ]).then(([_, updatedResearch]) => {
      return updatedResearch;
    });

    //* 새로운 리서치 참여 정보 생성
    //! 이 함수가 종속된 session은 updateResearch 함수가 종속된 session 과 동일하므로
    //! 같은 Promise.all 로 동시에 실행시킬 수 없습니다.
    const newResearchParticipation =
      await this.mongoResearchCreateService.createResearchParticipation(
        {
          researchParticipation: param.researchParticipation,
        },
        session,
      );
    return { updatedResearch, newResearchParticipation };
  }

  /**
   * @Transaction
   * 리서치를 끌올합니다.
   * 이 때, 리서치 끌올을 요청한 유저가 리서치 작성자가 아닌 경우 에러를 일으킵니다.
   * @author 현웅
   */
  async pullupResearch(
    param: {
      userId: string;
      researchId: string;
      research: Partial<Research>;
    },
    session: ClientSession,
  ) {
    //* 리서치 끌올을 요청한 유저가 리서치 작성자인지 확인
    const checkIsAuthor = this.mongoResearchFindService.isResearchAuthor({
      userId: param.userId,
      researchId: param.researchId,
    });
    //* 리서치를 끌올합니다.
    const pullUpResearch = this.mongoResearchUpdateService.pullupResearch(
      { researchId: param.researchId, research: param.research },
      session,
    );
    //* 위 두 함수를 동시에 실행하고 끌올된 리서치 정보를 반환
    return await Promise.all([checkIsAuthor, pullUpResearch]).then(
      ([_, updatedResearch]) => {
        return updatedResearch;
      },
    );
  }

  /**
   * @Transaction
   * 리서치를 수정합니다.
   * 이 때, 리서치 수정을 요청한 유저가 리서치 작성자가 아닌 경우 에러를 일으킵니다.
   * @return 수정된 리서치 정보
   * @author 현웅
   */
  async editResearch(
    param: {
      userId: string;
      researchId: string;
      research: Partial<Research>;
    },
    session: ClientSession,
  ) {
    //* 리서치 수정을 요청한 유저가 리서치 작성자인지 확인
    const checkIsAuthor = this.mongoResearchFindService.isResearchAuthor({
      userId: param.userId,
      researchId: param.researchId,
    });
    //* 리서치 내용을 수정
    const updateResearch = this.mongoResearchUpdateService.editResearch(
      { researchId: param.researchId, research: param.research },
      session,
    );
    //* 위 두 함수를 동시에 실행하고 수정된 리서치 정보를 반환
    return await Promise.all([checkIsAuthor, updateResearch]).then(
      ([_, updatedResearch]) => {
        return updatedResearch;
      },
    );
  }

  /**
   * @Transaction
   * 리서치를 마감합니다.
   * 이 때, 리서치 마감을 요청한 유저가 리서치 작성자가 아닌 경우 에러를 일으킵니다.
   * 리서치가 추가 크레딧을 증정하는 경우, 리서치 참여자들을 무작위 추첨한 후 추가 크레딧을 증정합니다.
   * @return 마감된 리서치 정보
   * @author 현웅
   */
  async closeResearch(
    param: { userId: string; researchId: string; skipValidate?: boolean },
    session?: ClientSession,
  ) {
    //* 리서치 마감을 요청한 유저가 리서치 작성자인지 확인
    const checkIsAuthor = this.mongoResearchFindService.isResearchAuthor({
      userId: param.userId,
      researchId: param.researchId,
      skipValidate: param.skipValidate,
    });
    //* 리서치 마감
    const closeResearch = this.mongoResearchUpdateService.closeResearch(
      { researchId: param.researchId },
      session,
    );
    //* 위 두 함수를 동시에 실행하고 마감된 리서치 정보를 반환
    const updatedResearch = await Promise.all([
      checkIsAuthor,
      closeResearch,
    ]).then(([_, updatedResearch]) => {
      return updatedResearch;
    });

    //* 마감한 리서치에 마감일이 지정되어 있던 경우,
    //* ScheduleRegistry 에 등록된 리서치 자동 마감 CronJob 을 삭제합니다.
    if (Boolean(updatedResearch.deadline)) {
      //TODO: 서버에서 같은 Container 를 두 개 돌리고 있기 때문에, 해당 부분이 처리되기 전까지는 일단 구동되지 않게 합니다.
      // this.deleteResearchAutoCloseCronJob(updatedResearch._id);
    }

    //* 마감한 리서치에 추가 크레딧이 걸려있는 경우, 추가 크레딧을 증정합니다.
    //! (await 를 걸지 않고 실행합니다. 즉, 업데이트 된 리서치 정보를 반환한 후 독립적으로 서버에서 시행됩니다.)
    if (
      updatedResearch.extraCredit > 0 &&
      updatedResearch.extraCreditReceiverNum > 0
    ) {
      this.distributeCredit({
        researchId: param.researchId,
        researchTitle: updatedResearch.title,
        extraCredit: updatedResearch.extraCredit,
        extraCreditReceiverNum: updatedResearch.extraCreditReceiverNum,
      });
    }

    return updatedResearch;
  }

  /**
   * 리서치에 걸려있는 추가 크레딧을 분배합니다.
   * Controller 단이 아닌, closeResearch() 에서 자체적인 로직을 통해 호출되면서
   * 동시에 정합성이 필요하므로 예외적으로 Service 단에서 Session 을 시작합니다.
   * @author 현웅
   */
  async distributeCredit(param: {
    researchId: string;
    researchTitle: string;
    extraCredit: number;
    extraCreditReceiverNum: number;
  }) {
    const userSession = await this.userConnection.startSession();
    const researchSession = await this.researchConnection.startSession();

    await tryMultiTransaction(async () => {
      //* 해당 리서치 참여정보를 모두 가져옵니다.
      const researchParticipations =
        await this.mongoResearchFindService.getResearchParticipations(
          param.researchId,
          { userId: true },
        );

      //* 참여한 사람들의 닉네임, 크레딧, fcm 토큰, 서비스 정보 수신 동의 여부를 가져옵니다.
      const participants = await this.mongoUserFindService.getUsersById({
        userIds: researchParticipations.map(
          (participation) => participation.userId,
        ),
        selectQuery: {
          nickname: true,
          credit: true,
          fcmToken: true,
          agreeReceiveServiceInfo: true,
        },
      });

      //* 해당 유저를 유저를 랜덤하게 섞습니다.
      //* 참고: https://bobbyhadz.com/blog/javascript-get-multiple-random-elements-from-array
      participants.sort(() => 0.5 - Math.random());

      //* 크레딧을 분배 받은 user 정보와 생성된 크레딧 변동내역을 저장할 배열
      let wonUsers: Partial<User>[] = [];
      const currentISOTime = getCurrentISOTime();

      //* 랜덤한 배열의 앞단부터 유저에게 크레딧을 증정합니다.
      for (const participant of participants) {
        //* 크레딧을 분배받은 인원 수가
        //* extraCreditReceiverNum 와 같거나 커진 경우, 크레딧 배분을 중지합니다.
        if (wonUsers.length >= param.extraCreditReceiverNum) break;

        const creditHistory: CreditHistory = {
          userId: participant._id,
          reason: param.researchTitle,
          type: CreditHistoryType.WIN_RESEARCH_EXTRA_CREDIT,
          scale: param.extraCredit,
          isIncome: true,
          balance: participant.credit + param.extraCredit,
          createdAt: currentISOTime,
        };

        //* 추가 크레딧을 증정하고, 유저 정보를 wonUserIds 배열에 추가합니다.
        await this.mongoUserCreateService.createCreditHistory(
          { userId: participant._id, creditHistory },
          userSession,
        );
        wonUsers.push(participant);
      }

      const notications: TokenMessage[] = [];

      //* fcmToken 이 존재하고 (로그아웃 하지 않은 유저),
      //* 서비스 정보 수신에 동의한 유저에게만 보낼 푸시알림 리스트를 만듭니다.
      wonUsers.forEach((receiver) => {
        if (Boolean(receiver.fcmToken) && receiver.agreeReceiveServiceInfo) {
          notications.push({
            token: receiver.fcmToken,
            notification: {
              title: WIN_EXTRA_CREDIT_ALARM_TITLE,
              body: WIN_EXTRA_CREDIT_ALARM_CONTENT({
                nickname: receiver.nickname,
                extraCredit: param.extraCredit,
              }),
            },
            data: { type: "WIN_RESEARCH_EXTRA_CREDIT" },
          });
        }
      });

      //* 1명 이상의 알림 대상자가 있는 경우, 푸시 알림을 보냅니다.
      //TODO: 실제 배포 전까지 주석처리 합니다.
      // if (notications.length) { //* (알림 대상자가 없을 때 알람을 보내면 Firebase 가 에러를 일으키므로 length 조건문을 답니다.)
      //   await this.firebaseService.sendMultiplePushAlarm(notications);
      // }

      //TODO: 리서치의 creditDistributed 플래그를 true로 설정
    }, [userSession, researchSession]);
    return;
  }

  /**
   * 마감일이 지정된 리서치가 새로 등록되거나,
   * 끌올하는 과정에서 마감일이 지정된 경우
   * 리서치 자동 마감 CronJob 을 만들고 ScheduleRegistry 에 등록합니다.
   *
   * ! 이 때, ScheduleRegistry 에 CronJob 을 등록할 때 에러가 나면 서버가 터지므로 반드시 try catch 를 사용합니다.
   * (ex. Job 이름이 겹치는 경우, Job 을 삭제할 때 해당 이름의 Job 이 없는 경우 등)
   * @author 현웅
   */
  addResearchAutoCloseCronJob(param: { researchId: string; deadline: string }) {
    //* 만약 마감일이 지정되지 않은 경우라면 바로 return 합니다.
    //* (이 함수에 도달하기 전에 여러번 검증을 거치지만 그래도 더 안전하게)
    if (!Boolean(param.deadline)) return;

    //* 리서치 마감 CronJob 의 이름이 겹치지 않도록 만들어줍니다.
    const cronJobName = RESEARCH_AUTO_CLOSE_CRONJOB_NAME(param.researchId);

    //* 리서치 마감일은 모두 GMT+0 기준으로 설정되어 있으므로, 이를 한국시간으로 바꿔줍니다.
    //TODO: 서버 시간이 한국시간이면, new Date() 가 ISO 시간을 한국 시간에 알아서 맞춰줍니다.
    const GMT9Deadline = new Date(param.deadline);
    // GMT9Deadline.setHours(GMT9Deadline.getHours() + 9);

    //* 리서치 마감 시간에 리서치 마감 함수를 호출하고
    //* 스스로를 삭제하는 자동 마감 CronJob 을 만듭니다.
    const researchCloseCronJob = new CronJob(
      //? 첫번째 인자(CronTime): 함수를 실행할 시각
      `0 ${GMT9Deadline.getMinutes()} ${GMT9Deadline.getHours()} ${GMT9Deadline.getDate()} ${
        GMT9Deadline.getMonth() + 1
      } *`,
      //? 두번째 인자(onTick): 지정된 시각에 실행할 함수
      async () => {
        await this.closeResearch({
          userId: "",
          researchId: param.researchId,
          skipValidate: true,
        });
      },
      //? 세번째 인자(onComplete): 함수 실행 완료 후 실행할 함수
      () => {
        //TODO: 리서치 마감 완료 후 Logger 남기기
      },
      //? 네번째 인자(start): 해당 시각에 함수를 실행할지 여부
      true,
      //? 다섯번째 인자(onComplete): CronTime 기준 시간
      "Asia/Seoul",
    );

    //! ScheduleRegistry 에 작업을 할 때는 반드시 try catch 를 사용합니다.
    try {
      //* 위에서 정의한 CronJob 을 ScheduleRegistry 에 등록합니다.
      this.schedulerRegistry.addCronJob(cronJobName, researchCloseCronJob);
      //TODO: CronJob 등록 후 Logger 남기기
      console.log(
        `리서치 ${param.researchId} 가 ${
          GMT9Deadline.getMonth() + 1
        }월 ${GMT9Deadline.getDate()}일 ${GMT9Deadline.getHours()}시 ${GMT9Deadline.getMinutes()}분에 마감됩니다.`,
      );
    } catch (error) {
      //TODO: CronJob 등록에 실패한 경우, Logger 남기기
      console.log(error);
    }
  }

  /**
   * 리서치가 마감된 경우 호출됩니다.
   * ScheduleRegistry 에 존재하는 리서치 자동 마감 CronJob 을 삭제합니다.
   * @author 현웅
   */
  async deleteResearchAutoCloseCronJob(param: { researchId: string }) {
    //! ScheduleRegistry 에 작업을 할 때는 반드시 try catch 를 사용합니다.
    try {
      this.schedulerRegistry.deleteCronJob(
        RESEARCH_AUTO_CLOSE_CRONJOB_NAME(param.researchId),
      );
    } catch (error) {
      //TODO: CronJob 삭제에 실패한 경우, Logger 남기기
      console.log(error);
    }
  }
}
