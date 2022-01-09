import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Post, PostDocument } from "../../Schema";

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private readonly Post: Model<PostDocument>,
  ) {}

  // Get Requests
  // 전체 리서치 반환
  async getAllPost() {
    return;
  }

  // 무한 스크롤 리서치 반환
  async getPostByScroll() {
    return;
  }

  // 특정 리서치 반환
  async getCertainPostById() {
    return;
  }

  // 랜덤 리서치 반환
  async getRandomPost() {
    return;
  }

  // Post Requests
  // 리서치 생성
  async createPost() {
    return;
  }

  // Post Requests
  // 리서치 댓글 생성
  async createPostComment() {
    return;
  }

  // Post Requests
  // 리서치 대댓글 생성
  async createPostCommentReply() {
    return;
  }

  // Put Requests
  // 리서치 수정
  async updatePost() {
    return;
  }

  // Put Requests
  // 리서치 댓글 수정
  async updatePostComment() {
    return;
  }

  // Put Requests
  // 리서치 대댓글 수정
  async updatePostCommentReply() {
    return;
  }

  // 리서치 연장
  async extendPost() {
    return;
  }

  // 리서치 마감
  async closePost() {
    return;
  }

  // 리서치 신고
  async reportPost() {
    return;
  }

  // 리서치 댓글 신고
  async reportPostComment() {
    return;
  }

  // 리서치 대댓글 신고
  async reportPostCommentReply() {
    return;
  }

  // Delete Requests
  // 리서치 삭제
  async deletePost() {
    return;
  }

  // 리서치 댓글 삭제
  async deletePostComment() {
    return;
  }

  // 리서치 대댓글 삭제
  async deletePostCommentReply() {
    return;
  }
}
