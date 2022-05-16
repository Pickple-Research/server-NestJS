import { Body, Controller, Post } from "@nestjs/common";
import { PartnerCreateService } from "src/Service";
import {
  PartnerCreateBodyDto,
  PartnerPostCreateBodyDto,
  PartnerProductCreateBodyDto,
} from "src/Dto";
import { getCurrentISOTime } from "src/Util";

@Controller("partners")
export class PartnerPostController {
  constructor(private readonly partnerCreateService: PartnerCreateService) {}

  @Post("")
  async uploadPartner(@Body() partnerCreateBodyDto: PartnerCreateBodyDto) {
    return await this.partnerCreateService.uploadPartner(partnerCreateBodyDto);
  }

  @Post("post")
  async uploadPost(@Body() partnerPostCreateBodyDto: PartnerPostCreateBodyDto) {
    return await this.partnerCreateService.uploadPost({
      ...partnerPostCreateBodyDto,
      createdAt: getCurrentISOTime(),
    });
  }

  @Post("product")
  async uploadProduct(
    @Body() partnerProductCreateBodyDto: PartnerProductCreateBodyDto,
  ) {
    return await this.partnerCreateService.uploadProduct({
      ...partnerProductCreateBodyDto,
    });
  }
}
