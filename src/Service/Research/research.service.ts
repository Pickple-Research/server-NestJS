import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Research, ResearchDocument } from "../../OldSchema";

@Injectable()
export class ResearchService {
  constructor(
    @InjectModel(Research.name)
    private readonly Research: Model<ResearchDocument>,
  ) {}

  // Get Requests
  // 전체 리서치 반환
  async getAllResearch() {
    return;
  }

  // 무한 스크롤 리서치 반환
  async getResearchByScroll() {
    return;
  }

  // 특정 리서치 반환
  async getCertainResearchById() {
    return;
  }

  // 랜덤 리서치 반환
  async getRandomResearch() {
    return;
  }

  // Post Requests
  // 리서치 생성
  async createResearch() {
    return;
  }

  // 리서치 댓글 생성
  async createResearchComment() {
    return;
  }

  // 리서치 대댓글 생성
  async createResearchCommentReply() {
    return;
  }

  // 리서치 수정
  async updateResearch() {
    return;
  }

  // 리서치 댓글 수정
  async updateResearchComment() {
    return;
  }

  // 리서치 대댓글 수정
  async updateResearchCommentReply() {
    return;
  }

  // 리서치 연장
  async extendResearch() {
    return;
  }

  // 리서치 마감
  async closeResearch() {
    return;
  }

  // 리서치 신고
  async reportResearch() {
    return;
  }

  // 리서치 댓글 신고
  async reportResearchComment() {
    return;
  }

  // 리서치 대댓글 신고
  async reportResearchCommentReply() {
    return;
  }

  // Delete Requests
  // 리서치 삭제
  async deleteResearch() {
    return;
  }

  // 리서치 댓글 삭제
  async deleteResearchComment() {
    return;
  }

  // 리서치 대댓글 삭제
  async deleteResearchCommentReply() {
    return;
  }
}
