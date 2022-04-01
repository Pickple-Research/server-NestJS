import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type ResearchCommentDocument = ResearchComment & Document;

/**
 * 리서치 댓글 스키마입니다. 리서치 기본 정보의 _id를 공유합니다.
 * @author 현웅
 */
@Schema()
export class ResearchComment {
  @Prop({ required: true }) // 댓글 내용
  content: string;
}

export const ResearchCommentSchema =
  SchemaFactory.createForClass(ResearchComment);
