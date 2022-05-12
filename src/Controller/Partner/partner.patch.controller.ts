import { Controller, Patch } from "@nestjs/common";
import { PartnerUpdateService } from "src/Service";

@Controller("partners")
export class PartnerPatchController {
  constructor(private readonly partnerUpdateService: PartnerUpdateService) {}

  @Patch("post")
  async uploadPost() {
    return await this.partnerUpdateService.updatePost();
  }

  @Patch("product")
  async uploadProduct() {
    return await this.partnerUpdateService.updateProduct();
  }
}
