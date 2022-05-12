import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types, Schema as MongooseSchema } from "mongoose";
import { PartnerPost, PartnerProduct } from "src/Schema";
import { PartnerType, Category } from "src/Object/Enum";

/**
 * 파트너 기본 정보 스키마입니다.
 * @author 현웅
 */
@Schema()
export class Partner {
  @Prop({ required: true, unique: true }) // 파트너 이름
  partnerName: string;

  @Prop({ enum: PartnerType, default: PartnerType.UNDEFINED }) // 파트너 타입
  partnerType: PartnerType;

  @Prop({ type: [String], enum: Category }) // 파트너의 카테고리
  category: Category[];

  @Prop({ type: [String], default: [] }) // 게시글/이벤트 _id
  postIds: string[];

  @Prop({ type: [String], default: [] }) // 제품/서비스 _id
  productIds: string[];

  @Prop() // 가입일자
  createdAt: string;

  //TODO: Record<string, string> 형태의 array를 저장해야 합니다.
  // @Prop({type: [], default: []}) // 외부 링크
  // externalLinks:string[]
}

export const PartnerSchema = SchemaFactory.createForClass(Partner);

export type PartnerDocument = Partner & Document;
