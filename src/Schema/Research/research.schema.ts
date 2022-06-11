import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Category } from "src/Object/Enum";

/**
 * 리서치 기본 정보 스키마입니다.
 * @author 현웅
 */
@Schema()
export class Research {
  //TODO: enum화
  // @Prop({ required: true }) // 리서치 진행자 타입 (일반 유저 or 파트너)
  @Prop() // 리서치 진행자 타입 (일반 유저 or 파트너)
  authorType: string;

  @Prop({ required: true }) // 리서치 업로더 _id
  authorId: string;

  @Prop({ required: true }) // 리서치 제목
  title: string;

  @Prop({ required: true }) // 설문지 폼 url
  link: string;

  @Prop({ required: true }) // 리서치 내용
  content: string;

  //TODO: enum화, required
  @Prop() // 리서치 목적
  purpose: string;

  //TODO: enum화, required
  @Prop() // 리서치 진행 단체
  organization: string;

  @Prop() // 참여 대상 (줄글 작성)
  target: string;

  // @Prop({ required: true }) // 예상 소요시간
  @Prop() // 예상 소요시간
  estimatedTime: number;

  @Prop({ required: true }) // 마감일
  deadline: string;

  @Prop() // 생성일
  createdAt: string;

  //TODO: enum화
  // @Prop({ required: true }) // 최소 참여조건
  @Prop() // 최소 참여조건
  eligibility: string;

  @Prop({ type: [String], enum: Category }) // 리서치 카테고리
  categories: Category[];

  @Prop({ default: false }) // 종료 여부. deadline이 지나기 전일지라도 사용자가 종료 가능.
  closed: boolean;

  @Prop({ default: false }) // 숨김 여부
  hidden: boolean;

  @Prop({ default: false }) // 삭제 여부
  deleted: boolean;

  @Prop({ default: false }) // (신고 등으로 인한) 블락 여부
  blocked: boolean;
}

export const ResearchSchema = SchemaFactory.createForClass(Research);

export type ResearchDocument = Research & Document;
