import { Controller, Inject, Request, Body, Post } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { MongoVoteFindService, MongoVoteCreateService } from "src/Mongo";
import {
  VoteCreateBodyDto,
  VoteCommentCreateBodyDto,
  VoteReplyCreateBodyDto,
  VoteReportBodyDto,
  VoteMypageBodyDto,
} from "src/Dto";
import { JwtUserInfo } from "src/Object/Type";
import { tryTransaction, tryMultiTransaction } from "src/Util";
import { MONGODB_VOTE_CONNECTION } from "src/Constant";
// import { getDummyVotes } from "src/Dummy";

@Controller("votes")
export class VotePostController {
  constructor(
    @InjectConnection(MONGODB_VOTE_CONNECTION)
    private readonly voteConnection: Connection,
  ) {}

  @Inject()
  private readonly mongoVoteFindService: MongoVoteFindService;
  @Inject()
  private readonly mongoVoteCreateService: MongoVoteCreateService;

  /**
   * @Transaction
   * 새로운 투표를 업로드합니다.
   * @return 생성된 투표 정보
   * @author 현웅
   */
  @Post("")
  async uploadVote(
    @Request() req: { user: JwtUserInfo },
    @Body() body: VoteCreateBodyDto,
  ) {
    const voteSession = await this.voteConnection.startSession();
    return await tryMultiTransaction(async () => {
      const newVote = await this.mongoVoteCreateService.createVote(
        { vote: { authorId: req.user.userId, ...body } },
        voteSession,
      );
      return newVote;
    }, [voteSession]);
  }

  /**
   * @Transaction
   * 투표 댓글을 작성합니다.
   * @return 업데이트된 투표 정보와 생성된 투표 댓글
   * @author 현웅
   */
  @Post("comments")
  async uploadVoteComment(
    @Request() req: { user: JwtUserInfo },
    @Body() body: VoteCommentCreateBodyDto,
  ) {
    const voteSession = await this.voteConnection.startSession();

    return await tryTransaction(async () => {
      const { updatedVote, newComment } =
        await this.mongoVoteCreateService.createVoteComment(
          {
            comment: {
              voteId: body.voteId,
              authorId: req.user.userId,
              content: body.content,
            },
          },
          voteSession,
        );
      return { updatedVote, newComment };
    }, voteSession);
  }

  /**
   * @Transaction
   * 투표 대댓글을 작성합니다.
   * @return 업데이트된 투표 정보와 생성된 투표 대댓글
   * @author 현웅
   */
  @Post("replies")
  async uploadVoteReply(
    @Request() req: { user: JwtUserInfo },
    @Body() body: VoteReplyCreateBodyDto,
  ) {
    const voteSession = await this.voteConnection.startSession();

    return await tryTransaction(async () => {
      const { updatedVote, newReply } =
        await this.mongoVoteCreateService.createVoteReply(
          {
            reply: {
              voteId: body.voteId,
              commentId: body.commentId,
              authorId: req.user.userId,
              content: body.content,
            },
          },
          voteSession,
        );
      return { updatedVote, newReply };
    }, voteSession);
  }

  /**
   * 투표를 신고합니다.
   * @author 현웅
   */
  @Post("report")
  async reportVote(
    @Request() req: { user: JwtUserInfo },
    @Body() body: VoteReportBodyDto,
  ) {
    return await this.mongoVoteCreateService.createVoteReport({
      userId: req.user.userId,
      userNickname: req.user.userNickname,
      voteId: body.voteId,
      content: body.content,
    });
  }

  /**
   * 마이페이지 - 스크랩/참여한 투표 목록을 더 가져옵니다.
   * @author 현웅
   */
  @Post("mypage")
  async getMypageVotes(@Body() body: VoteMypageBodyDto) {
    return await this.mongoVoteFindService.getVotes(body.voteIds);
  }

  // /**
  //  * 더미 투표를 생성합니다.
  //  * @author 현웅
  //  */
  // @Post("dummy")
  // async crateDummyVotes(@Request() req: { user: JwtUserInfo }) {
  //   const dummyVotes = getDummyVotes({
  //     authorId: req.user.userId,
  //     num: 56,
  //   });

  //   for (const vote of dummyVotes) {
  //     await this.mongoVoteCreateService.createVote({ vote });
  //   }

  //   return;
  // }
}
