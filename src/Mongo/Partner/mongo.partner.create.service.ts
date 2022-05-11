import { Injectable } from "@nestjs/common";
import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { Model, Connection } from "mongoose";
import {
  Partner,
  PartnerDocument,
  PartnerPost,
  PartnerPostDocument,
  PartnerProduct,
  PartnerProductDocument,
} from "src/Schema";
import { MONGODB_PARTNER_CONNECTION } from "src/Constant";
import { tryTransaction } from "src/Util";

@Injectable()
export class MongoPartnerCreateService {
  constructor(
    @InjectModel(Partner.name)
    private readonly Partner: Model<PartnerDocument>,
    @InjectModel(PartnerPost.name)
    private readonly PartnerPost: Model<PartnerPostDocument>,
    @InjectModel(PartnerProduct.name)
    private readonly PartnerProduct: Model<PartnerProductDocument>,

    @InjectConnection(MONGODB_PARTNER_CONNECTION)
    private readonly connection: Connection,
  ) {}

  /**
   * @Transaction
   * 새로운 파트너를 등록합니다.
   * @author 현웅
   */
  async createPartner() {
    const session = await this.connection.startSession();
    return await tryTransaction(session, async () => {
      return;
    });
  }
}
