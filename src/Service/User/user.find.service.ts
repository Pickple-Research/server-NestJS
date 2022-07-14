import { Injectable, Inject } from "@nestjs/common";
import {
  MongoUserFindService,
  MongoResearchFindService,
  MongoVoteFindService,
} from "src/Mongo";
import { UserResearch, UserVote } from "src/Schema";

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
    const authorize = this.mongoUserFindService.authenticate(email, password);
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
  async getUserActivities(param: {
    userId: string;
    userResearch: UserResearch;
    userVote: UserVote;
  }) {
    const getCreditHistories = this.mongoUserFindService.getCreditHisories(
      param.userId,
    );
    const getScrappedResearches = this.mongoResearchFindService.getResearches(
      param.userResearch.scrappedResearchIds.splice(0, 20),
    );
    const getParticipatedResearches =
      this.mongoResearchFindService.getResearches(
        param.userResearch.participatedResearchInfos
          .splice(0, 20)
          .map((info) => info.researchId),
      );
    const getUploadedResearches =
      this.mongoResearchFindService.getUploadedResearches(param.userId);
    const getScrappedVotes = this.mongoVoteFindService.getVotes(
      param.userVote.scrappedVoteIds.splice(0, 20),
    );
    const getParticipatedVotes = this.mongoVoteFindService.getVotes(
      param.userVote.participatedVoteInfos
        .splice(0, 20)
        .map((info) => info.voteId),
    );
    const getUploadedVotes = this.mongoVoteFindService.getUploadedVotes(
      param.userId,
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
