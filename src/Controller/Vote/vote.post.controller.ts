import { Controller, Inject, Request, Body, Post } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { MongoUserUpdateService, MongoVoteCreateService } from "src/Mongo";
import {
  VoteCreateBodyDto,
  VoteCommentCreateBodyDto,
  VoteReplyCreateBodyDto,
} from "src/Dto";
import { JwtUserInfo } from "src/Object/Type";
import { tryTransaction } from "src/Util";
import { MONGODB_USER_CONNECTION, MONGODB_VOTE_CONNECTION } from "src/Constant";

@Controller("votes")
export class VotePostController {
  constructor(
    @InjectConnection(MONGODB_USER_CONNECTION)
    private readonly userConnection: Connection,
    @InjectConnection(MONGODB_VOTE_CONNECTION)
    private readonly voteConnection: Connection,
  ) {}

  @Inject()
  private readonly mongoUserUpdateService: MongoUserUpdateService;
  @Inject()
  private readonly mongoVoteCreateService: MongoVoteCreateService;

  /**
   * @Transaction
   * 새로운 투표를 업로드합니다.
   * 먼저 투표를 생성하고, 해당 투표 _id를 유저 활동 정보에 추가합니다.
   * @return 생성된 투표 정보
   * @author 현웅
   */
  @Post("")
  async uploadVote(
    @Request() req: { user: JwtUserInfo },
    @Body() body: VoteCreateBodyDto,
  ) {
    const voteSession = await this.voteConnection.startSession();

    return await tryTransaction(async () => {
      const newVote = await this.mongoVoteCreateService.createVote(
        // req.user.userId,
        "62a2e7e94048ace3fc28b87e",
        body,
        voteSession,
      );

      await this.mongoUserUpdateService.uploadVote(
        // req.user.userId,
        "62a2e7e94048ace3fc28b87e",
        newVote._id,
      );

      return newVote;
    }, voteSession);
  }

  /**
   * @Transaction
   * 투표 댓글을 작성합니다.
   * @return 생성된 투표 댓글
   * @author 현웅
   */
  @Post("comments")
  async uploadVoteComment(
    @Request() req: { user: JwtUserInfo },
    @Body() body: VoteCommentCreateBodyDto,
  ) {
    const voteSession = await this.voteConnection.startSession();

    return await tryTransaction(async () => {
      const newComment = await this.mongoVoteCreateService.createVoteComment(
        {
          voteId: body.voteId,
          // authorId: req.user.userId,
          authorId: "req.user.userId",
          authorNickname: "req.user.userNickname",
          content: body.content,
        },
        voteSession,
      );
      return newComment;
    }, voteSession);
  }

  /**
   * @Transaction
   * 투표 대댓글을 작성합니다.
   * @return 생성된 투표 대댓글
   * @author 현웅
   */
  @Post("replies")
  async uploadVoteReply(
    @Request() req: { user: JwtUserInfo },
    @Body() body: VoteReplyCreateBodyDto,
  ) {
    const voteSession = await this.voteConnection.startSession();

    return await tryTransaction(async () => {
      const newReply = await this.mongoVoteCreateService.createVoteReply(
        {
          voteId: body.voteId,
          commentId: body.commentId,
          // authorId: req.user.userId,
          authorId: "req.user.userId",
          authorNickname: "req.user.userNickname",
          content: body.content,
        },
        voteSession,
      );
      return newReply;
    }, voteSession);
  }
}
