import { Injectable, Inject } from "@nestjs/common";
import { ClientSession } from "mongoose";
import {
  MongoResearchFindService,
  MongoResearchCreateService,
  MongoResearchUpdateService,
  MongoResearchDeleteService,
} from "src/Mongo";
import { Research, ResearchScrap, ResearchParticipation } from "src/Schema";

/**
 * 리서치 관련 데이터가 수정되는 경우
 * @author 현웅
 */
@Injectable()
export class ResearchUpdateService {
  constructor() {}

  @Inject()
  private readonly mongoResearchFindService: MongoResearchFindService;
  @Inject()
  private readonly mongoResearchCreateService: MongoResearchCreateService;
  @Inject()
  private readonly mongoResearchUpdateService: MongoResearchUpdateService;
  @Inject()
  private readonly mongoResearchDeleteService: MongoResearchDeleteService;

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
    //* 리서치 참여자 수 1 증가
    const updatedResearch =
      await this.mongoResearchUpdateService.updateParticipant(
        {
          researchId: param.researchId,
        },
        session,
      );
    //* 새로운 리서치 참여 정보 생성
    const newResearchParticipation =
      await this.mongoResearchCreateService.createResearchParticipation(
        {
          researchParticipation: param.researchParticipation,
        },
        session,
      );
    //* 위 두 함수를 순차적으로 시행하고 해당 결과를 반환
    //! (두 함수는 같은 세션에 종속되어 있으므로 Promise.all 로 동시에 실행시키면 안 됩니다.)
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
  async updateResearch(
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
    const updateResearch = this.mongoResearchUpdateService.updateResearch(
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
   * TODO: 또한 마감된 리서치가 추가 크레딧을 증정하는 경우, 리서치 참여자들을 무작위 추첨한 후 추가 크레딧을 증정합니다.
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

    return updatedResearch;
  }
}
