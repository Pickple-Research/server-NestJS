import { Injectable, Inject } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection, ClientSession } from "mongoose";
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
    param: { userId: string; researchId: string },
    session: ClientSession,
  ) {
    //* 리서치 마감을 요청한 유저가 리서치 작성자인지 확인
    const checkIsAuthor = this.mongoResearchFindService.isResearchAuthor({
      userId: param.userId,
      researchId: param.researchId,
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
      //* (알림 대상자가 없을 때 알람을 보내면 Firebase 가 에러를 일으킵니다.)
      //TODO: 실제 배포 전까지 주석처리 합니다.
      // if (notications.length) {
      //   await this.firebaseService.sendMultiplePushAlarm(notications);
      // }

      //TODO: 리서치의 creditDistributed 플래그를 true로 설정
    }, [userSession, researchSession]);
    return;
  }
}
