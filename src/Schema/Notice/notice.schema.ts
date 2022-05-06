import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class Notice {
  @Prop({ required: true }) // 공지 제목
  title: string;

  @Prop({ required: true }) // 공지 내용
  content: string;

  @Prop({ type: [String], default: [] })
  imageUrls: string[];

  @Prop({ default: false }) // 숨김 여부
  hide: boolean;

  @Prop() // 생성 날짜
  createdAt: Date;
}

export const NoticeSchema = SchemaFactory.createForClass(Notice);

export type NoticeDocument = Notice & Document;
