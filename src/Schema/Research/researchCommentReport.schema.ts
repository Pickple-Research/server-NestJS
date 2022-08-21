import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * 신고 대상 리서치 (대)댓글 정보.
 * 에러가 나지 않도록 최소한의 정보만 정의합니다.
 * @author 현웅
 */
class ResearchCommentReply {
  _id?: string;
  content?: string;
}

/**
 * 리서치 (대)댓글 신고 스키마입니다.
 * @author 현웅
 */
@Schema()
export class ResearchCommentReport {
  @Prop({ index: true }) // 신고자 _id
  userId: string;

  @Prop() // 신고자 닉네임
  userNickname: string;

  @Prop({ type: ResearchCommentReply }) // 신고 대상 리서치 댓글 정보
  comment?: Partial<ResearchCommentReply>;

  @Prop({ type: ResearchCommentReply }) // 신고 대상 리서치 대댓글 정보
  reply?: Partial<ResearchCommentReply>;

  @Prop() // 신고 타입
  type?: string;

  @Prop() // 신고 내용
  content: string;

  @Prop() // 신고 날짜
  createdAt: string;
}

export const ResearchCommentReportSchema = SchemaFactory.createForClass(
  ResearchCommentReport,
);

export type ResearchCommentReportDocument = ResearchCommentReport & Document;
