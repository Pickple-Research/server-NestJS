import { Controller, Patch, Body } from "@nestjs/common";
import { PartnerUpdateService } from "src/Service";

@Controller("partners")
export class PartnerPatchController {
  constructor(private readonly partnerUpdateService: PartnerUpdateService) {}

  /**
   * 게시글/이벤트 정보를 업데이트합니다.
   * @author 현웅
   */
  @Patch("post")
  async uploadPost() {
    return await this.partnerUpdateService.updatePost();
  }

  /**
   * 제품/서비스 정보를 업데이트합니다.
   * @author 현웅
   */
  @Patch("product")
  async uploadProduct() {
    return await this.partnerUpdateService.updateProduct();
  }
}
