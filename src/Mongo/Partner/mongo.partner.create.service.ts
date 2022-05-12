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
import { PartnerCreateBodyDto } from "src/Dto";

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
   * 새로운 파트너를 등록합니다.
   * @author 현웅
   */
  async uploadPartner(partnerCreateBodyDto: PartnerCreateBodyDto) {
    await this.Partner.create([partnerCreateBodyDto]);
    return;
  }

  /**
   * @Transaction
   * 새로운 게시글/이벤트를 등록합니다.
   * @author 현웅
   */
  async uploadPost(partnerPost: PartnerPost) {
    const session = await this.connection.startSession();
    return await tryTransaction(session, async () => {
      const newPost = await this.PartnerPost.create([partnerPost], {
        session,
      });
      const newPostId = newPost[0]._id;

      //* 새로운 게시글 _id를 파트너의 postIds 맨 앞에 추가합니다.
      await this.Partner.findByIdAndUpdate(partnerPost.partnerId, {
        $push: { postIds: { $each: [newPostId], $position: 0 } },
      });
      return;
    });
  }

  /**
   * @Transaction
   * 새로운 제품/서비스를 등록합니다.
   * @author 현웅
   */
  async uploadProduct(partnerProduct: PartnerProduct) {
    const session = await this.connection.startSession();
    return await tryTransaction(session, async () => {
      const newProduct = await this.PartnerProduct.create([partnerProduct], {
        session,
      });
      const newProductId = newProduct[0]._id;

      //* 새로운 제품 _id를 파트너의 productIds 맨 앞에 추가합니다.
      await this.Partner.findByIdAndUpdate(partnerProduct.partnerId, {
        $push: { productIds: { $each: [newProductId], $position: 0 } },
      });
      return;
    });
  }
}
