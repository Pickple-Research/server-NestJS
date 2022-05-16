import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  Partner,
  PartnerDocument,
  PartnerPost,
  PartnerPostDocument,
  PartnerProduct,
  PartnerProductDocument,
} from "src/Schema";

@Injectable()
export class MongoPartnerFindService {
  constructor(
    @InjectModel(Partner.name)
    private readonly Partner: Model<PartnerDocument>,
    @InjectModel(PartnerPost.name)
    private readonly PartnerPost: Model<PartnerPostDocument>,
  ) {}

  async getPartners() {}
}
