import { Controller, Inject, Request, Param, Body, Post } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { Vote, VoteComment, VoteReply, VoteCommentReport } from "src/Schema";
import { MongoVoteFindService, MongoVoteCreateService } from "src/Mongo";
import {
  VoteCreateBodyDto,
  VoteCommentCreateBodyDto,
  VoteReplyCreateBodyDto,
  VoteReportBodyDto,
  VoteCommentReportBodyDto,
  VoteReplyReportBodyDto,
  VoteMypageBodyDto,
} from "src/Dto";
import { JwtUserInfo } from "src/Object/Type";
import {
  tryTransaction,
  tryMultiTransaction,
  getCurrentISOTime,
} from "src/Util";
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

    const vote: Vote = {
      ...body,
      authorId: req.user.userId,
      createdAt: getCurrentISOTime(),
    };

    return await tryMultiTransaction(async () => {
      const newVote = await this.mongoVoteCreateService.createVote(
        { vote },
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
  @Post(":voteId/comments")
  async uploadVoteComment(
    @Request() req: { user: JwtUserInfo },
    @Param("voteId") voteId: string,
    @Body() body: VoteCommentCreateBodyDto,
  ) {
    const voteSession = await this.voteConnection.startSession();

    const comment: VoteComment = {
      voteId,
      authorId: req.user.userId,
      content: body.content,
      createdAt: getCurrentISOTime(),
    };

    return await tryTransaction(async () => {
      const { updatedVote, newComment } =
        await this.mongoVoteCreateService.createVoteComment(
          { comment },
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
  @Post(":voteId/comments/:commentId/replies")
  async uploadVoteReply(
    @Request() req: { user: JwtUserInfo },
    @Param("voteId") voteId: string,
    @Param("commentId") commentId: string,
    @Body() body: VoteCommentCreateBodyDto,
  ) {
    const voteSession = await this.voteConnection.startSession();

    const reply: VoteReply = {
      voteId,
      commentId,
      authorId: req.user.userId,
      content: body.content,
      createdAt: getCurrentISOTime(),
    };

    return await tryTransaction(async () => {
      const { updatedVote, newReply } =
        await this.mongoVoteCreateService.createVoteReply(
          { reply },
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
   * 투표 댓글을 신고합니다.
   * @author 현웅
   */
  @Post("report/comments")
  async reportVoteComment(
    @Request() req: { user: JwtUserInfo },
    @Body() body: VoteCommentReportBodyDto,
  ) {
    const voteCommentReport: VoteCommentReport = {
      userId: req.user.userId,
      userNickname: req.user.userNickname,
      commentId: body.commentId,
      content: body.content,
      createdAt: getCurrentISOTime(),
    };
    return await this.mongoVoteCreateService.createVoteCommentReport({
      voteCommentReport,
    });
  }

  /**
   * 투표 대댓글을 신고합니다.
   * @author 현웅
   */
  @Post("report/replies")
  async reportVoteReply(
    @Request() req: { user: JwtUserInfo },
    @Body() body: VoteReplyReportBodyDto,
  ) {
    const voteCommentReport: VoteCommentReport = {
      userId: req.user.userId,
      userNickname: req.user.userNickname,
      replyId: body.replyId,
      content: body.content,
      createdAt: getCurrentISOTime(),
    };
    return await this.mongoVoteCreateService.createVoteCommentReport({
      voteCommentReport,
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
