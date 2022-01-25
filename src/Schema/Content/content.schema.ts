import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { ContentComment } from "..";
import { User } from "..";

export type ContentDocument = Content & Document;

@Schema()
export class Content {
  // #Independent Prop :
  @Prop() // 유저 id
  userId: string;

  @Prop() // 제목
  title: string;

  @Prop() // 내용
  content: string;

  @Prop({ type: [String], default: [] }) // 이미지 url
  imageUrls: string[];

  @Prop({ default: false }) // 숨김 여부
  hide: boolean;

  @Prop() // 생성 날짜
  createdAt: Date;

  // #Referencing Prop (참조하는 스키마의 id만 저장) :
  @Prop({ type: [String], default: [] }) // 조회한 유저 id
  viewedUserIds: string[];

  @Prop({ type: [String], default: [] }) // 좋아요 누른 유저 id
  likedUserIds: string[];

  // #Partial Embedded Prop (참조하는 스키마 정보의 일부만 떼어내 저장) :

  // #Fully Embedded Prop (참조하는 스키마 정보를 모두 저장) :
  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: "ContentComment" }],
    default: [],
  }) // 댓글
  comments: ContentComment[];
}

export const ContentSchema = SchemaFactory.createForClass(Content);
