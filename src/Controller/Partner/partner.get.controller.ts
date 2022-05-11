import { Controller, Get } from "@nestjs/common";
import { PartnerFindService } from "src/Service";
import { Public } from "src/Security/Metadata";

@Controller("partners")
export class PartnerGetController {
  constructor(private readonly partnerFindService: PartnerFindService) {}

  @Public()
  @Get("test")
  async testPartnerRouter() {
    return "test Partner Router";
  }

  @Public()
  @Get("")
  async getPartners() {
    return await this.partnerFindService.getPartners();
  }
}
