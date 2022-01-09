import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { General, GeneralDocument } from "../../Schema";

@Injectable()
export class GeneralService {
  constructor(
    @InjectModel(General.name) private readonly General: Model<GeneralDocument>,
  ) {}

  // Get Requests
  // 전체 투표 반환
  async getAllGeneral() {
    return;
  }
  // 무한 스크롤 투표 반환
  async getGeneralByScroll() {
    return;
  }
  // 특정 투표 반환
  async getCertainGeneralById() {
    return;
  }
  // 랜덤 투표 반환
  async getRandomGeneral() {
    return;
  }

  // Post Requests
  // 투표 생성
  async createGeneral() {
    return;
  }
  // 댓글 생성
  async createGeneralComment() {
    return;
  }
  // 대댓글 생성
  async createGeneralCommentReply() {
    return;
  }

  // Put Requests
  // 투표 참여
  async participateGeneral() {
    return;
  }
  // 투표 좋아요 토글
  async toggleGeneralLike() {
    return;
  }
  // 댓글 수정
  async updateGeneralComment() {
    return;
  }
  // 대댓글 수정
  async updateGeneralCommentReply() {
    return;
  }
  // 투표 신고
  async reportGeneral() {
    return;
  }
  // 댓글 신고
  async reportGeneralComment() {
    return;
  }
  // 대댓글 신고
  async reportGeneralCommentReply() {
    return;
  }

  // Delete Requests
  // 투표 삭제
  async deleteGeneral() {
    return;
  }
}
