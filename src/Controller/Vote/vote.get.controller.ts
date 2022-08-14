import { Controller, Inject, Request, Param, Get } from "@nestjs/common";
import { MongoVoteFindService } from "src/Mongo";
import { JwtUserInfo } from "src/Object/Type";
import { Public } from "src/Security/Metadata";
import { VoteNotFoundException } from "src/Exception";

@Controller("votes")
export class VoteGetController {
  constructor() {}

  @Inject() private readonly mongoVoteFindService: MongoVoteFindService;

  /**
   * 최신 투표를 가져옵니다.
   * @author 현웅
   */
  @Public()
  @Get("")
  async getRecentVotes() {
    return await this.mongoVoteFindService.getRecentVotes();
  }

  /**
   * HOT 투표를 가져옵니다.
   * 기준은 최근 100건의 투표 참여 중 제일 많은 참여를 이끌어낸 투표입니다.
   * @author 현웅
   */
  @Public()
  @Get("hot")
  async getHotVote() {
    return await this.mongoVoteFindService.getHotVote();
  }

  /**
   * 주어진 투표 _id을 기준으로 하여 더 최근의 투표를 모두 찾고 반환합니다.
   * @author 현웅
   */
  @Public()
  @Get("newer/:voteId")
  async getNewerVotes(@Param("voteId") voteId: string) {
    return await this.mongoVoteFindService.getNewerVotes(voteId);
  }

  /**
   * 주어진 투표 _id을 기준으로 하여 과거의 투표 20개를 찾고 반환합니다.
   * @author 현웅
   */
  @Public()
  @Get("older/:voteId")
  async getOlderVotes(@Param("voteId") voteId: string) {
    return await this.mongoVoteFindService.getOlderVotes(voteId);
  }

  /**
   * 더 예전에 업로드한 투표를 20개 찾고 반환합니다
   * @author 현웅
   */
  @Get("uploaded/older/:voteId")
  async getOlderUploadedVotes(
    @Request() req: { user: JwtUserInfo },
    @Param("voteId") voteId: string,
  ) {
    return await this.mongoVoteFindService.getOlderUploadedVotes({
      userId: req.user.userId,
      voteId,
    });
  }

  /**
   * _id로 특정 투표를 가져옵니다.
   * 존재하지 않는 경우 404 에러를 반환합니다.
   * @author 현웅
   */
  @Public()
  @Get(":voteId")
  async getVoteById(@Param("voteId") voteId: string) {
    const vote = await this.mongoVoteFindService.getVoteById(voteId);

    if (!vote) throw new VoteNotFoundException();
    return vote;
  }

  @Public()
  @Get(":voteId/comments")
  async getVoteComments(@Param("voteId") voteId: string) {
    return await this.mongoVoteFindService.getVoteComments(voteId);
  }
}
