import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "..";

export type SurveytipDocument = Surveytip & Document;

@Schema()
export class Surveytip {
  @Prop() // 제목
  title: string;

  @Prop() // 작성자
  author: string;

  @Prop() // 작성자 레벨
  author_lvl: number;

  @Prop() // 내용
  content: string;

  @Prop() // 날짜
  date: Date;

  @Prop() // 카테고리
  category: string;

  @Prop({ default: 0 }) // 좋아요
  likes: number;

  @Prop({
    // 좋아요 누른 유저들
    type: [{ type: MongooseSchema.Types.ObjectId, ref: "User" }],
    default: [],
  })
  liked_users: User[];

  @Prop()
  author_userid: string;

  @Prop({ type: [String], default: [] })
  image_urls: string[];
}

export const SurveytipSchema = SchemaFactory.createForClass(Surveytip);
