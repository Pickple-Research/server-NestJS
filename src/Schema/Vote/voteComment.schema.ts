import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { VoteReply } from "./voteReply.schema";

/**
 * 투표 댓글 스키마입니다.
 * @author 현웅
 */
@Schema()
export class VoteComment {
  @Prop({ required: true }) // 투표 _id
  voteId: string;

  @Prop({ required: true }) // 작성자 _id
  authorId: string;

  @Prop({}) // 작성자 닉네임
  authorNickname?: string;

  @Prop({ required: true }) // 댓글 내용
  content: string;

  @Prop({}) // 작성 날짜
  createdAt?: string;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: "VoteReply" }],
    default: [],
  }) // 대댓글 _id
  replies?: VoteReply[];
}

export const VoteCommentSchema = SchemaFactory.createForClass(VoteComment);

export type VoteCommentDocument = VoteComment & Document;
