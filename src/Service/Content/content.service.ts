import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Content, ContentDocument } from "../../Schema";

@Injectable()
export class ContentService {
  constructor(
    @InjectModel(Content.name) private readonly Content: Model<ContentDocument>,
  ) {}

  // Get Requests
  // 전체 콘텐츠 반환
  async getAllContent() {
    return;
  }
  // 특정 콘텐츠 반환 (조회수 +1)
  async getCertainContentById() {
    return;
  }

  // Post Requests
  // 콘텐츠 생성
  async createContent() {
    return;
  }
  // 콘텐츠 댓글 생성
  async createContentComment() {
    return;
  }
  // 콘텐츠 댓글에 대댓글 생성
  async createContentCommentReply() {
    return;
  }

  // Put Requests
  // 특정 콘텐츠 수정
  async updateContent() {
    return;
  }
  // 콘텐츠 좋아요 토글
  async toggleContentLike() {
    return;
  }
  // 콘텐츠 댓글 신고
  async reportContentComment() {
    return;
  }
  // 콘텐츠 대댓글 신고
  async reportContentCommentReply() {
    return;
  }

  // Delete Requests
  // 콘텐츠 삭제
  async deleteContent() {
    return;
  }
  // 콘텐츠 댓글 삭제
  async deleteContentComment() {
    return;
  }
  // 콘텐츠 대댓글 삭제
  async deleteContentCommentReply() {
    return;
  }
}
