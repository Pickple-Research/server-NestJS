import { Injectable, Inject } from "@nestjs/common";
import { MongoPartnerCreateService } from "src/Mongo";

@Injectable()
export class PartnerCreateService {
  constructor() {}

  @Inject()
  private readonly mongoPartnerCreateService: MongoPartnerCreateService;

  async createPartner() {
    return await this.mongoPartnerCreateService.createPartner();
  }
}
