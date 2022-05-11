import { Injectable } from "@nestjs/common";
import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { Model, Connection } from "mongoose";
import {
  PartnerPost,
  PartnerPostDocument,
  PartnerProduct,
  PartnerProductDocument,
} from "src/Schema";
import { MONGODB_PARTNER_CONNECTION } from "src/Constant";

@Injectable()
export class MongoPartnerUpdateService {
  constructor(
    @InjectModel(PartnerPost.name)
    private readonly PartnerPost: Model<PartnerPostDocument>,
    @InjectModel(PartnerProduct.name)
    private readonly PartnerProduct: Model<PartnerProductDocument>,

    @InjectConnection(MONGODB_PARTNER_CONNECTION)
    private readonly connection: Connection,
  ) {}

  async uploadProduct() {}

  async uploadPost() {}
}
