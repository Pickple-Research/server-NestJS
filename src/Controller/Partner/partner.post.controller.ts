import { Controller, Post } from "@nestjs/common";
import { PartnerCreateService } from "src/Service";

@Controller("partners")
export class PartnerPostController {
  constructor(private readonly partnerCreateService: PartnerCreateService) {}

  @Post("")
  async createPartner() {
    return await this.partnerCreateService.createPartner();
  }
}
