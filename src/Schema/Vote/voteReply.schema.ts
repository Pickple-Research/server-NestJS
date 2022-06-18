import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * 투표 대댓글 스키마입니다.
 * @author 현웅
 */
@Schema()
export class VoteReply {
  @Prop({ required: true }) // 투표 _id
  voteId: string;

  @Prop({ required: true }) // 댓글 _id
  commentId: string;

  @Prop({ required: true }) // 작성자 _id
  authorId: string;

  @Prop({}) // 작성자 닉네임
  authorNickname?: string;

  @Prop({ required: true }) // 대댓글 내용
  content: string;

  @Prop({ required: true }) // 작성 날짜
  createdAt?: string;
}

export const VoteReplySchema = SchemaFactory.createForClass(VoteReply);

export type VoteReplyDocument = VoteReply & Document;
