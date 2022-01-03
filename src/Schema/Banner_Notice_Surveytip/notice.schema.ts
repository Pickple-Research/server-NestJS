import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type NoticeDocument = Notice & Document;

@Schema()
export class Notice {
  @Prop() //제목
  title: string;

  @Prop() //작성자
  author: string;

  @Prop() //내용
  content: string;

  @Prop() //날짜
  date: Date;

  @Prop({ type: [String], default: [] })
  image_urls: string[];

  @Prop({ default: false })
  hide: boolean;
}

export const NoticeSchema = SchemaFactory.createForClass(Notice);
