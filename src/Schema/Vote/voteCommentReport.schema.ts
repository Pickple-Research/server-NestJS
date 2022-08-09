import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * 투표 (대)댓글 신고 스키마입니다.
 * @author 현웅
 */
@Schema()
export class VoteCommentReport {
  @Prop() // 신고자 _id
  userId: string;

  @Prop() // 신고자 닉네임
  userNickname: string;

  @Prop() // 신고 대상 투표 댓글 _id
  commentId?: string;

  @Prop() // 신고 대상 투표 대댓글 _id
  replyId?: string;

  @Prop() // 신고 타입
  type?: string;

  @Prop() // 신고 내용
  content: string;

  @Prop() // 신고 날짜
  createdAt: string;
}

export const VoteCommentReportSchema =
  SchemaFactory.createForClass(VoteCommentReport);

export type VoteCommentReportDocument = VoteCommentReport & Document;
