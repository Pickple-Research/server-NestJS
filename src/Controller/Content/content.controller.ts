import {
  Headers,
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
} from "@nestjs/common";
import { ContentService } from "../../Service";
import { Content } from "../../Schema";

@Controller("content")
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  // Get Requests
  // 전체 콘텐츠 반환
  @Get("")
  async getAllContent() {
    return await this.contentService.getAllContent();
  }

  // 특정 콘텐츠 반환 (조회수 +1)
  @Get("content-id/:content_id")
  async getCertainContentById() {
    return await this.contentService.getCertainContentById();
  }

  // Post Requests
  // 콘텐츠 생성
  @Post("")
  async createContent() {
    return await this.contentService.createContent();
  }

  // 콘텐츠 댓글 생성
  @Post("comment")
  async createContentComment() {
    return await this.contentService.createContentComment();
  }

  // 콘텐츠 댓글에 대댓글 생성
  @Post("reply")
  async createContentCommentReply() {
    return await this.contentService.createContentCommentReply();
  }

  // Put Requests
  // 특정 콘텐츠 수정
  @Put("")
  async updateContent() {
    return await this.contentService.updateContent();
  }

  // 콘텐츠 좋아요 토글
  @Put("like")
  async toggleContentLike() {
    return await this.contentService.toggleContentLike();
  }

  // 콘텐츠 댓글 신고
  @Put("report/comment")
  async reportContentComment() {
    return await this.contentService.reportContentComment();
  }

  // 콘텐츠 대댓글 신고
  @Put("report/reply")
  async reportContentCommentReply() {
    return await this.contentService.reportContentCommentReply();
  }

  // Delete Requests
  // 콘텐츠 삭제
  @Delete("")
  async deleteContent(@Headers() header: { content_id: string }) {
    return await this.contentService.deleteContent();
  }

  // 콘텐츠 댓글 삭제
  @Delete("comment")
  async deleteContentComment(
    @Headers() header: { content_id: string; comment_id: string },
  ) {
    return await this.contentService.deleteContentComment();
  }

  // 콘텐츠 대댓글 삭제
  @Delete("reply")
  async deleteContentCommentReply(
    @Headers()
    header: {
      content_id: string;
      comment_id: string;
      reply_id: string;
    },
  ) {
    return await this.contentService.deleteContentCommentReply();
  }
}
