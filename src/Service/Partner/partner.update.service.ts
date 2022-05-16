import { Injectable, Inject } from "@nestjs/common";
import { MongoPartnerUpdateService } from "src/Mongo";

@Injectable()
export class PartnerUpdateService {
  constructor() {}

  @Inject()
  private readonly mongoPartnerUpdateService: MongoPartnerUpdateService;

  async updatePost() {
    return await this.mongoPartnerUpdateService.updatePost();
  }

  async updateProduct() {
    return await this.mongoPartnerUpdateService.updateProduct();
  }

  async followPartner(userId: string, partnerId: string) {
    return await this.mongoPartnerUpdateService.updateFollower(
      userId,
      partnerId,
    );
  }

  async unfollowPartner(userId: string, partnerId: string) {
    return await this.mongoPartnerUpdateService.updateUnfollower(
      userId,
      partnerId,
    );
  }
}
