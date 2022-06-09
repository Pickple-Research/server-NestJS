import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * TODO: 댓글만 따로 모아두는 게 나을 것 같습니다.
 * 투표 댓글 스키마입니다. 투표 기본 정보의 _id를 공유합니다.
 * @author 현웅
 */
@Schema()
export class VoteComment {
  @Prop({ required: true }) // 댓글 내용
  content: string;
}

export const VoteCommentSchema = SchemaFactory.createForClass(VoteComment);

export type VoteCommentDocument = VoteComment & Document;
