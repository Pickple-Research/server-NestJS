import { Body, Controller, Get, Post } from "@nestjs/common";
import { BannerService } from "../../Service";
import { Banner } from "../../Schema";

@Controller("banner")
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  // Get Requests
  // 테스트 API
  @Get("")
  async testBannerRouter() {
    return await this.bannerService.testBannerRouter();
  }
}
