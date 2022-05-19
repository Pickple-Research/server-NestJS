import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { Public } from "src/Security/Metadata";

@Controller("")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get("health")
  async healthCheck() {
    return await this.appService.healthCheck();
  }
}
