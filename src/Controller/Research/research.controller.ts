import { Body, Controller, Get, Post, Put, Delete } from "@nestjs/common";
import { ResearchService } from "../../Service";
// import { Research } from "../../Schema";

@Controller("research")
export class ResearchController {
  constructor(private readonly researchService: ResearchService) {}

  // #Get Requests
  // 전체 리서치 반환
  @Get("")
  async getAllResearch() {
    return await this.researchService.getAllResearch();
  }

  // 무한 스크롤 리서치 반환
  @Get("scroll/:page")
  async getResearchByScroll() {
    return await this.researchService.getResearchByScroll();
  }

  // 특정 리서치 반환
  @Get("post-id/:post_id")
  async getCertainResearchById() {
    return await this.researchService.getCertainResearchById();
  }

  // 랜덤 리서치 반환
  @Get("random/:number")
  async getRandomResearch() {
    return await this.researchService.getRandomResearch();
  }

  // #Post Requests
  // 리서치 생성
  @Post("")
  async createResearch() {
    return await this.researchService.createResearch();
  }

  // 리서치 댓글 생성
  @Post("comment")
  async createResearchComment() {
    return await this.researchService.createResearchComment();
  }

  // 리서치 대댓글 생성
  @Post("reply")
  async createResearchCommentReply() {
    return await this.researchService.createResearchCommentReply();
  }

  // #Put Requests
  // 리서치 수정
  @Put("")
  async updateResearch() {
    return await this.researchService.updateResearch();
  }

  // 리서치 댓글 수정
  @Put("comment")
  async updateResearchComment() {
    return await this.researchService.updateResearchComment();
  }

  // 리서치 대댓글 수정
  @Put()
  async updateResearchCommentReply() {
    return await this.researchService.updateResearchCommentReply();
  }

  // 리서치 연장
  @Put()
  async extendResearch() {
    return await this.researchService.extendResearch();
  }

  // 리서치 마감
  @Put()
  async closeResearch() {
    return await this.researchService.closeResearch();
  }

  // 리서치 신고
  @Put()
  async reportResearch() {
    return await this.researchService.reportResearch();
  }

  // 리서치 댓글 신고
  @Put()
  async reportResearchComment() {
    return await this.researchService.reportResearchComment();
  }

  // 리서치 대댓글 신고
  @Put()
  async reportResearchCommentReply() {
    return await this.researchService.reportResearchCommentReply();
  }

  // #Delete Requests
  // 리서치 삭제
  @Delete()
  async deleteResearch() {
    return await this.researchService.deleteResearch();
  }

  // 리서치 댓글 삭제
  @Delete()
  async deleteResearchComment() {
    return await this.researchService.deleteResearchComment();
  }

  // 리서치 대댓글 삭제
  @Delete()
  async deleteResearchCommentReply() {
    return await this.researchService.deleteResearchCommentReply();
  }
}
