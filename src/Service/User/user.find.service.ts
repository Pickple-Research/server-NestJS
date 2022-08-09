import { Injectable, Inject } from "@nestjs/common";
import {
  MongoUserFindService,
  MongoResearchFindService,
  MongoVoteFindService,
} from "src/Mongo";

@Injectable()
export class UserFindService {
  constructor() {}

  @Inject() private readonly mongoUserFindService: MongoUserFindService;
  @Inject() private readonly mongoResearchFindService: MongoResearchFindService;
  @Inject() private readonly mongoVoteFindService: MongoVoteFindService;

  /**
   * 로그인 시 실행됩니다. 아래 정보들을 찾아서 반환합니다:
   * 1. 유저의 크레딧 사용내역, 유저 알림, (CreditHistories, Notifications)
   * 2. 리서치 조회/스크랩/참여 정보, 투표 조회/스크랩/참여 정보,
   *   (ResearchScraps, ResearchParticipations, VoteScraps, VoteParticipations)
   * 3. 스크랩/참여한 리서치와 투표의 실제 정보 (2. 정보를 바탕으로 검색)
   * 4. 유저가 업로드한 리서치와 투표 정보
   * @author 현웅
   */
  async getUserActivities(param: { userId: string }) {
    const getCreditHistories = this.mongoUserFindService.getCreditHisories(
      param.userId,
    );
    // const getNotifications = this.mongoUserFindService.getNotifications(
    //   param.userId,
    // );
    const getResearchViews = this.mongoResearchFindService.getUserResearchViews(
      param.userId,
    );
    const getResearchScraps =
      this.mongoResearchFindService.getUserResearchScraps(param.userId);
    const getResearchParticipations =
      this.mongoResearchFindService.getUserResearchParticipations(param.userId);
    const getUploadedResearches =
      this.mongoResearchFindService.getUploadedResearches(param.userId);
    const getVoteViews = this.mongoVoteFindService.getUserVoteViews(
      param.userId,
    );
    const getVoteScraps = this.mongoVoteFindService.getUserVoteScraps(
      param.userId,
    );
    const getVoteParticipations =
      this.mongoVoteFindService.getUserVoteParticipations(param.userId);
    const getUploadedVotes = this.mongoVoteFindService.getUploadedVotes(
      param.userId,
    );

    const [
      creditHistories,
      researchViews,
      researchScraps,
      researchParticipations,
      uploadedResearches,
      voteViews,
      voteScraps,
      voteParticipations,
      uploadedVotes,
    ] = await Promise.all([
      getCreditHistories,
      getResearchViews,
      getResearchScraps,
      getResearchParticipations,
      getUploadedResearches,
      getVoteViews,
      getVoteScraps,
      getVoteParticipations,
      getUploadedVotes,
    ]);

    //* ResearchScraps, ResearchParticipations, VoteScraps, VoteParticipations 는 실제 정보로 다시 반환
    const getScrappedResearches = this.mongoResearchFindService.getResearches(
      researchScraps.slice(0, 20).map((info) => info.researchId),
    );
    const getParticipatedResearches =
      this.mongoResearchFindService.getResearches(
        researchParticipations.slice(0, 20).map((info) => info.researchId),
      );
    const getScrappedVotes = this.mongoVoteFindService.getVotes(
      voteScraps.slice(0, 20).map((info) => info.voteId),
    );
    const getParticipatedVotes = this.mongoVoteFindService.getVotes(
      voteParticipations.slice(0, 20).map((info) => info.voteId),
    );

    const [
      scrappedResearches,
      participatedResearches,
      scrappedVotes,
      participatedVotes,
    ] = await Promise.all([
      getScrappedResearches,
      getParticipatedResearches,
      getScrappedVotes,
      getParticipatedVotes,
    ]);

    return {
      creditHistories,
      researchViews,
      researchScraps,
      researchParticipations,
      scrappedResearches,
      participatedResearches,
      uploadedResearches,
      voteViews,
      voteScraps,
      voteParticipations,
      scrappedVotes,
      participatedVotes,
      uploadedVotes,
    };
  }
}
