import { Injectable, Inject } from "@nestjs/common";
import { MongoPartnerFindService } from "src/Mongo";

@Injectable()
export class PartnerFindService {
  constructor() {}

  @Inject()
  private readonly mongoPartnerFindService: MongoPartnerFindService;

  async getPartners() {
    return await this.mongoPartnerFindService.getPartners();
  }
}
