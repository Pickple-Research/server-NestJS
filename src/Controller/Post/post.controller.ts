import { Body, Controller, Get, Post, Put, Delete } from "@nestjs/common";
import { PostService } from "../../Service";
// import { Post } from "../../Schema";

@Controller("post")
export class PostController {
  constructor(private readonly postService: PostService) {}

  // Get Requests
  // 전체 리서치 반환
  @Get("")
  async getAllPost() {
    return await this.postService.getAllPost();
  }

  // 무한 스크롤 리서치 반환
  @Get("scroll/:page")
  async getPostByScroll() {
    return await this.postService.getPostByScroll();
  }

  // 특정 리서치 반환
  @Get("post-id/:post_id")
  async getCertainPostById() {
    return await this.postService.getCertainPostById();
  }

  // 랜덤 리서치 반환
  @Get("random/:number")
  async getRandomPost() {
    return await this.postService.getRandomPost();
  }

  // Post Requests
  // 리서치 생성
  @Post("")
  async createPost() {
    return await this.postService.createPost();
  }

  // Post Requests
  // 리서치 댓글 생성
  @Post("comment")
  async createPostComment() {
    return await this.postService.createPostComment();
  }

  // Post Requests
  // 리서치 대댓글 생성
  @Post("reply")
  async createPostCommentReply() {
    return await this.postService.createPostCommentReply();
  }

  // Put Requests
  // 리서치 수정
  @Put("")
  async updatePost() {
    return await this.postService.updatePost();
  }

  // Put Requests
  // 리서치 댓글 수정
  @Put("comment")
  async updatePostComment() {
    return await this.postService.updatePostComment();
  }

  // Put Requests
  // 리서치 대댓글 수정
  @Put()
  async updatePostCommentReply() {
    return await this.postService.updatePostCommentReply();
  }

  // 리서치 연장
  @Put()
  async extendPost() {
    return await this.postService.extendPost();
  }

  // 리서치 마감
  @Put()
  async closePost() {
    return await this.postService.closePost();
  }

  // 리서치 신고
  @Put()
  async reportPost() {
    return await this.postService.reportPost();
  }

  // 리서치 댓글 신고
  @Put()
  async reportPostComment() {
    return await this.postService.reportPostComment();
  }

  // 리서치 대댓글 신고
  @Put()
  async reportPostCommentReply() {
    return await this.postService.reportPostCommentReply();
  }

  // Delete Requests
  // 리서치 삭제
  @Delete()
  async deletePost() {
    return await this.postService.deletePost();
  }

  // 리서치 댓글 삭제
  @Delete()
  async deletePostComment() {
    return await this.postService.deletePostComment();
  }

  // 리서치 대댓글 삭제
  @Delete()
  async deletePostCommentReply() {
    return await this.postService.deletePostCommentReply();
  }
}
