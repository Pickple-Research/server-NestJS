import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { VoteOption, VoteOptionSchema } from "./Embedded";

/**
 * 투표 기본 정보 스키마입니다.
 * @author 현웅
 */
@Schema()
export class Vote {
  @Prop({ required: true }) // 업로더 _id
  authorId: string;

  @Prop() // 업로더 닉네임
  authorNickname: string;

  @Prop({ required: true }) // 투표 제목
  title: string;

  @Prop({ required: true }) // 투표 내용
  content: string;

  @Prop({ required: true, type: [VoteOptionSchema], default: [] }) // 선택지들
  options: VoteOption[];

  @Prop({ required: true, default: false }) // 중복 선택 허용 여부
  allowMultiChoice: boolean;

  @Prop() // 마감일
  deadline: string;

  @Prop() // 생성 날짜
  createdAt: Date;

  @Prop({ default: false }) // 종료 여부. deadline이 지나기 전일지라도 사용자가 종료 가능.
  closed: boolean;

  @Prop({ default: false }) // 숨김 여부
  hidden: boolean;

  @Prop({ default: false }) // 삭제 여부
  deleted: boolean;

  @Prop({ default: false }) // (신고 등으로 인한) 블락 여부
  blocked: boolean;
}

export const VoteSchema = SchemaFactory.createForClass(Vote);

export type VoteDocument = Vote & Document;
