import { Controller, Inject, Body, Patch } from "@nestjs/common";
import { Roles } from "src/Security/Metadata";
import { AdminUpdateService, ResearchUpdateService } from "src/Service";
import {
  MongoResearchFindService,
  MongoResearchUpdateService,
  MongoVoteUpdateService,
} from "src/Mongo";
import {
  ResearchBlockBodyDto,
  VoteBlockBodyDto,
  CommentBlockBodyDto,
  ReplyBlockBodyDto,
} from "src/Dto";
import { UserType } from "src/Object/Enum";

/**
 * 관리자만 사용하는 Patch 컨트롤러입니다.
 * 리서치 일괄마감, 리서치 및 투표 (대)댓글 블락 처리 등을 처리할 수 있습니다.
 * @author 현웅
 */
@Controller("admin")
export class AdminPatchController {
  constructor(
    private readonly adminUpdateService: AdminUpdateService,
    private readonly researchUpdateService: ResearchUpdateService,
  ) {}

  @Inject()
  private readonly mongoResearchFindService: MongoResearchFindService;
  @Inject()
  private readonly mongoResearchUpdateService: MongoResearchUpdateService;
  @Inject()
  private readonly mongoVoteUpdateService: MongoVoteUpdateService;

  /**
   * 마감 기한이 지났지만 아직 마감되지 않은 모든 리서치를 마감합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Patch("researches/close/all")
  async closeAllResearch() {
    const openedResearches =
      await this.mongoResearchFindService.getAllOpenedResearchWithDeadline();

    for (const research of openedResearches) {
      //* 마감일이 설정되어 있지 않은 리서치인 경우, 한번 더 걸러냅니다.
      if (!Boolean(research.deadline)) continue;
      //* 마감일이 지난 리서치인 경우, 리서치를 마감합니다.
      //* (크레딧 추첨도 내부적으로 처리됩니다)
      if (new Date(research.deadline) < new Date()) {
        await this.researchUpdateService.closeResearch({
          userId: "",
          researchId: research._id,
          skipValidate: true,
        });
      }
    }
  }

  /**
   * 리서치를 블락처리합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Patch("researches/block")
  async blockResearch(@Body() body: ResearchBlockBodyDto) {
    return await this.mongoResearchUpdateService.blockResearch(body.researchId);
  }

  /**
   * 리서치 댓글을 블락처리합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Patch("researches/comments/block")
  async blockResearchComment(@Body() body: CommentBlockBodyDto) {
    return await this.mongoResearchUpdateService.blockResearchComment(
      body.commentId,
    );
  }

  /**
   * 리서치 대댓글을 블락처리합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Patch("researches/replies/block")
  async blockResearchReply(@Body() body: ReplyBlockBodyDto) {
    return await this.mongoResearchUpdateService.blockResearchReply(
      body.replyId,
    );
  }

  /**
   * 투표를 블락처리합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Patch("votes/block")
  async blockVote(@Body() body: VoteBlockBodyDto) {
    return await this.mongoVoteUpdateService.blockVote(body.voteId);
  }

  /**
   * 투표 댓글을 블락처리합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Patch("votes/comments/block")
  async blockVoteComment(@Body() body: CommentBlockBodyDto) {
    return await this.mongoVoteUpdateService.blockVoteComment(body.commentId);
  }

  /**
   * 투표 대댓글을 블락처리합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Patch("votes/replies/block")
  async blockVoteReply(@Body() body: ReplyBlockBodyDto) {
    return await this.mongoVoteUpdateService.blockVoteReply(body.replyId);
  }
}
