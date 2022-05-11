import { Injectable, Inject } from "@nestjs/common";
import { MongoPartnerUpdateService } from "src/Mongo";

@Injectable()
export class PartnerUpdateService {
  constructor() {}

  @Inject()
  private readonly mongoPartnerUpdateService: MongoPartnerUpdateService;

  async uploadPost() {
    return await this.mongoPartnerUpdateService.uploadPost();
  }

  async uploadProduct() {
    return await this.mongoPartnerUpdateService.uploadProduct();
  }
}
