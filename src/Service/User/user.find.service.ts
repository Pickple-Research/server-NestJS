import { Injectable, Inject } from "@nestjs/common";
import {
  MongoUserFindService,
  MongoResearchFindService,
  MongoVoteFindService,
} from "src/Mongo";
import { UserActivityBodyDto } from "src/Dto";

@Injectable()
export class UserFindService {
  constructor() {}

  @Inject() private readonly mongoUserFindService: MongoUserFindService;
  @Inject() private readonly mongoResearchFindService: MongoResearchFindService;
  @Inject() private readonly mongoVoteFindService: MongoVoteFindService;

  /**
   * 이메일과 비밀번호를 받아 로그인합니다.
   * 성공적인 경우, UserPrivacy를 제외한 유저 정보를 반환합니다.
   * @author 현웅
   */
  async loginWithEmail(email: string, password: string) {
    //* 이메일과 비밀번호가 유효한지 확인합니다.
    const authorize = this.mongoUserFindService.authorize(email, password);
    //* 유저 정보를 받아옵니다.
    const getUserInfo = this.mongoUserFindService.getUserInfoByEmail(email);

    const userInfo = await Promise.all([authorize, getUserInfo]).then(
      ([_, userInfo]) => {
        return userInfo;
      },
    );
    return userInfo;
  }

  /**
   * 유저의 크레딧 사용내역과
   * 스크랩/참여/업로드한 리서치/투표 정보를 가져옵니다.
   * @author 현웅
   */
  async getUserActivities(param: UserActivityBodyDto) {
    const getCreditHistories = this.mongoUserFindService.getCreditHisories(
      param.creditHistoryIds,
    );
    const getScrappedResearches = this.mongoResearchFindService.getResearches(
      param.scrappedResearchIds,
    );
    const getParticipatedResearches =
      this.mongoResearchFindService.getResearches(
        param.participatedResearchIds,
      );
    const getUploadedResearches = this.mongoResearchFindService.getResearches(
      param.uploadedResearchIds,
    );
    const getScrappedVotes = this.mongoVoteFindService.getVotes(
      param.scrappedVoteIds,
    );
    const getParticipatedVotes = this.mongoVoteFindService.getVotes(
      param.participatedVoteIds,
    );
    const getUploadedVotes = this.mongoVoteFindService.getVotes(
      param.uploadedVoteIds,
    );

    const [
      creditHistories,
      scrappedResearches,
      participatedResearches,
      uploadedResearches,
      scrappedVotes,
      participatedVotes,
      uploadedVotes,
    ] = await Promise.all([
      getCreditHistories,
      getScrappedResearches,
      getParticipatedResearches,
      getUploadedResearches,
      getScrappedVotes,
      getParticipatedVotes,
      getUploadedVotes,
    ]);

    return {
      creditHistories,
      scrappedResearches,
      participatedResearches,
      uploadedResearches,
      scrappedVotes,
      participatedVotes,
      uploadedVotes,
    };
  }
}
