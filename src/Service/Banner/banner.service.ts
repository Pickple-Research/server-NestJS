import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Banner, BannerDocument } from "../../Schema";

@Injectable()
export class BannerService {
  constructor(
    @InjectModel(Banner.name) private readonly Banner: Model<BannerDocument>,
  ) {}

  // Get Requests
  // 숨김 or 완료 처리되지 않은 모든 배너 반환
  async getAllBanner() {
    return;
  }

  // Post Requests
  // 배너 생성
  async createBanner(banner_id: string) {
    return banner_id;
  }

  // Delete Requests
  // 배너 삭제
  async deleteBanner() {
    return;
  }
}
