import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * 투표 기본 정보 스키마입니다.
 * @author 현웅
 */
@Schema()
export class Vote {
  @Prop({ required: true }) // 투표 제목
  title: string;

  @Prop({ required: true }) // 투표 내용
  content: string;

  @Prop() // 생성 날짜
  createdAt: Date;
}

export const VoteSchema = SchemaFactory.createForClass(Vote);

export type VoteDocument = Vote & Document;
