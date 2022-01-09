import { Headers, Body, Controller, Delete, Get, Post } from "@nestjs/common";
import { BannerService } from "../../Service";
import { Banner } from "../../Schema";

@Controller("banner")
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  // Get Requests
  // 숨김 or 완료 처리되지 않은 모든 배너 반환
  @Get("")
  async getAllBanner() {
    return await this.bannerService.getAllBanner();
  }

  // Post Requests
  // 배너 생성
  @Post("")
  async createBanner(@Body() body: { banner_id: string }) {
    return await this.bannerService.createBanner(body.banner_id);
  }

  // Delete Requests
  // 배너 삭제
  @Delete("")
  async deleteBanner(@Headers() header: { banner_id: string }) {
    return await this.bannerService.deleteBanner();
  }
}
