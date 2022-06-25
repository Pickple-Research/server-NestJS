import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { ResearchReply } from "./researchReply.schema";

/**
 * 리서치 댓글 스키마입니다.
 * @author 현웅
 */
@Schema()
export class ResearchComment {
  @Prop({ required: true }) // 리서치 _id
  researchId: string;

  @Prop({ required: true }) // 작성자 _id
  authorId: string;

  @Prop({}) // 작성자 닉네임
  authorNickname?: string;

  @Prop({ required: true }) // 댓글 내용
  content: string;

  @Prop({ required: true }) // 작성 날짜
  createdAt?: string;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: "ResearchReply" }],
    default: [],
  }) // 대댓글 _id
  replies?: ResearchReply[];
}

export const ResearchCommentSchema =
  SchemaFactory.createForClass(ResearchComment);

export type ResearchCommentDocument = ResearchComment & Document;
