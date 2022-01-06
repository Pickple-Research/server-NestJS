import { Body, Controller, Get, Post } from "@nestjs/common";
import { GeneralService } from "../../Service";
import { General } from "../../Schema";

@Controller("general")
export class GeneralController {
  constructor(private readonly generalService: GeneralService) {}

  // Get Requests
  // 테스트 API
  @Get("")
  async testGeneralRouter() {
    return await this.generalService.testGeneralRouter();
  }
}
