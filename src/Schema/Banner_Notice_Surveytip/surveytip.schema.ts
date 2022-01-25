import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "..";
import { SurveytipCategory } from "../../Enum";

export type SurveytipDocument = Surveytip & Document;

@Schema()
export class Surveytip {
  // #Independent Prop :
  @Prop() // 작성자 id
  userId: string;

  @Prop() // 작성자 닉네임
  userNickname: string;

  @Prop() // 제목
  title: string;

  @Prop() // 내용
  content: string;

  @Prop({ type: [String], default: [] }) // 이미지 주소
  imageUrls: string[];

  @Prop() // 작성자 레벨
  userLevel: number;

  @Prop({ enum: SurveytipCategory }) // 카테고리
  surveytipCategory: SurveytipCategory;

  @Prop() // 생성 날짜
  createdAt: Date;

  // #Referencing Prop (참조하는 스키마의 id만 저장) :
  @Prop({ type: [String], default: [] }) // 좋아요 누른 유저 id
  likedUserIds: string[];

  // #Partial Embedded Prop (참조하는 스키마 정보의 일부만 떼어내 저장) :

  // #Fully Embedded Prop (참조하는 스키마 정보를 모두 저장) :
}

export const SurveytipSchema = SchemaFactory.createForClass(Surveytip);
