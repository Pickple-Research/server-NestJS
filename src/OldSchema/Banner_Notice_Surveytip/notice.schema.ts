import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type NoticeDocument = Notice & Document;

@Schema()
export class Notice {
  // #Independent Prop :
  @Prop() // 작성자 id
  userId: string;

  @Prop() // 공지 제목
  title: string;

  @Prop() // 공지 내용
  content: string;

  @Prop({ type: [String], default: [] })
  imageUrls: string[];

  @Prop({ default: false }) // 숨김 여부
  hide: boolean;

  @Prop() // 생성 날짜
  createdAt: Date;

  // #Referencing Prop (참조하는 스키마의 id만 저장) :

  // #Partial Embedded Prop (참조하는 스키마 정보의 일부만 떼어내 저장) :

  // #Fully Embedded Prop (참조하는 스키마 정보를 모두 저장) :
}

export const NoticeSchema = SchemaFactory.createForClass(Notice);
