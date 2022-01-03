import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { ContentComment } from "..";
import { User } from "..";

export type ContentDocument = Content & Document;

@Schema()
export class Content {
  @Prop()
  title: string; // 제목

  @Prop()
  author: string; // 저자

  @Prop()
  content: string; // 콘텐츠

  @Prop()
  date: Date; // 날짜

  @Prop({ type: [String], default: [] }) // 이미지 url
  image_urls: string[];

  @Prop({
    // 댓글
    type: [{ type: MongooseSchema.Types.ObjectId, ref: "ContentComment" }],
    default: [],
  })
  comments: ContentComment[];

  @Prop({ default: 0 }) // TODO : like 정의 다시할 것
  likes: number;

  @Prop({ default: 0 })
  visit: number;

  @Prop({ default: false })
  hide: boolean;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: "User" }],
    default: [],
  })
  liked_users: User[];
}

export const ContentSchema = SchemaFactory.createForClass(Content);
