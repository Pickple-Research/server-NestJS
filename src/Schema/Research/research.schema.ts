import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type ResearchDocument = Research & Document;

/**
 * 리서치 기본 정보 스키마입니다.
 * @author 현웅
 */
@Schema()
export class Research {
  @Prop({ required: true }) // 리서치 제목
  title: string;

  @Prop({ required: true }) // 리서치 내용
  content: string;

  @Prop() // 생성 날짜
  createdAt: Date;
}

export const ResearchSchema = SchemaFactory.createForClass(Research);
