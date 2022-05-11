import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { ProductType } from "src/Object/Enum";

/**
 * 파트너 제품/서비스 스키마입니다.
 * @author 현웅
 */
@Schema({ _id: false })
export class PartnerProductInfo {
  @Prop({ required: true }) // 제품/서비스명
  productName: string;

  @Prop() // 가격 (크레딧)
  price: number;

  @Prop({ enum: ProductType }) // 제품/서비스 타입
  productType: ProductType;

  @Prop() // 제품 설명
  description: string;

  @Prop({ type: [String] }) // 제품 사진
  photoUrls: string[];
}

const PartnerProductInfoSchema =
  SchemaFactory.createForClass(PartnerProductInfo);

@Schema()
export class PartnerProduct {
  @Prop({ type: [PartnerProductInfoSchema], default: [] }) // 파트너 제품 및 이벤트 정보들
  products: PartnerProductInfo[];
}

export const PartnerProductSchema =
  SchemaFactory.createForClass(PartnerProduct);

export type PartnerProductDocument = PartnerProduct & Document;
