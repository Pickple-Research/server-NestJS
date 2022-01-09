import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Surveytip, SurveytipDocument } from "../../Schema";

@Injectable()
export class SurveytipService {
  constructor(
    @InjectModel(Surveytip.name)
    private readonly Surveytip: Model<SurveytipDocument>,
  ) {}

  // Get Requests
  // 전체 서베이팁 반환
  async getAllSurveytip() {
    return;
  }

  // 특정 서베이팁 반환
  async getCertainSurveytipById() {
    return;
  }

  // Post Requests
  // 서베이팁 생성
  async createSurveytip() {
    return;
  }

  // Put Requests
  // 서베이팁 수정
  async updateSurveytip() {
    return;
  }

  // 서베이팁 좋아요 토글
  async toggleSurveytipLike() {
    return;
  }

  // Delete Requests
  // 서베이팁 삭제
  async deleteSurveytip() {
    return;
  }
}
