import { Body, Controller, Get, Post } from "@nestjs/common";
import { SurveytipService } from "../../Service";
import { Surveytip } from "../../Schema";

@Controller("surveytip")
export class SurveytipController {
  constructor(private readonly surveytipService: SurveytipService) {}

  // Get Requests
  // 테스트 API
  @Get("")
  async testSurveytipRouter() {
    return await this.surveytipService.testSurveytipRouter();
  }
}
