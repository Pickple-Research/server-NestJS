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
      param.userResearch.scrappedResearchIds.slice(0, 20),
    );
    const getParticipatedResearches =
      this.mongoResearchFindService.getResearches(
        param.userResearch.participatedResearchInfos
          .slice(0, 20)
          .map((info) => info.researchId),
      );
    const getUploadedResearches =
      this.mongoResearchFindService.getUploadedResearches(param.userId);
    const getScrappedVotes = this.mongoVoteFindService.getVotes(
      param.userVote.scrappedVoteIds.slice(0, 20),
    );
    const getParticipatedVotes = this.mongoVoteFindService.getVotes(
      param.userVote.participatedVoteInfos
        .slice(0, 20)
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
