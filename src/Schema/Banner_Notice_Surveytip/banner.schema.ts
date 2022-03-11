import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { BannerCategory } from "../../Object/Enum";

export type BannerDocument = Banner & Document;

@Schema()
export class Banner {
  // #Independent Prop :
  @Prop() // 작성자 id
  userId: string;

  @Prop() // 타이틀
  title: string;

  @Prop() // 배너 내용 간략히 설명
  content: string;

  @Prop() // 클릭시 이동 주소
  linkUrl: string;

  @Prop() // S3 버켓 주소
  imageUrl: string;

  @Prop({ default: false }) // 배너 숨김 여부
  hide: boolean;

  @Prop({ default: false }) // 리서치/이벤트 타입 배너인 경우 완료 여부
  done: boolean;

  @Prop({ enum: BannerCategory }) // 배너 타입
  bannerCategory: BannerCategory;

  @Prop() // 생성 날짜
  createdAt: Date;

  // #Referencing Prop (참조하는 스키마의 id만 저장) :

  // #Partial Embedded Prop (참조하는 스키마 정보의 일부만 떼어내 저장) :

  // #Fully Embedded Prop (참조하는 스키마 정보를 모두 저장) :
}

export const BannerSchema = SchemaFactory.createForClass(Banner);
