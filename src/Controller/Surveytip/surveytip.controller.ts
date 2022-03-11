import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Headers,
} from "@nestjs/common";
import { SurveytipService } from "../../Service";
import { Surveytip } from "../../Schema";

@Controller("surveytips")
export class SurveytipController {
  constructor(private readonly surveytipService: SurveytipService) {}

  // Get Requests
  // 전체 서베이팁 반환
  @Get("")
  async getAllSurveytip() {
    return await this.surveytipService.getAllSurveytip();
  }

  // 특정 서베이팁 반환
  @Get(":surveytip_id")
  async getCertainSurveytipById() {
    return await this.surveytipService.getCertainSurveytipById();
  }

  // Post Requests
  // 서베이팁 생성
  @Post("")
  async createSurveytip() {
    return await this.surveytipService.createSurveytip();
  }

  // Put Requests
  // 서베이팁 수정
  @Put("")
  async updateSurveytip() {
    return await this.surveytipService.updateSurveytip();
  }

  // 서베이팁 좋아요 토글
  @Put("like")
  async toggleSurveytipLike() {
    return await this.surveytipService.toggleSurveytipLike();
  }

  // Delete Requests
  // 서베이팁 삭제
  @Delete("")
  async deleteSurveytip(@Headers() header: { surveytip_id: string }) {
    return await this.surveytipService.deleteSurveytip();
  }
}
