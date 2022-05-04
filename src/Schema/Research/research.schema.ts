import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { ResearchEstimatedTime, Category } from "src/Object/Enum";

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

  @Prop({ required: true }) // 마감일
  deadline: string;

  @Prop({ required: true }) // 참여대상 (줄글 작성)
  target: string;

  @Prop({ required: true }) // 설문지 폼 url
  formUrl: string;

  @Prop({ required: true, enum: ResearchEstimatedTime }) // 예상 소요시간
  estimatedTime: ResearchEstimatedTime;

  //TODO: enum화
  @Prop({ required: true }) // 리서치 진행자 타입 (일반 유저 or 파트너)
  researcherType: string;

  @Prop({ required: true }) // 리서치 진행자 Id
  researcherId: string;

  //TODO: enum화
  @Prop({ required: true }) // 최소 참여조건
  eligibility: string;

  @Prop({ type: [String], enum: Category }) // 리서치 카테고리
  categories: Category[];

  @Prop({ default: 0 }) // 조회수
  viewedNum: number;

  @Prop({ default: 0 }) // 스크랩수
  scrappedNum: number;

  @Prop({ default: 0 }) // 참여자수
  participatedNum: number;

  @Prop() // 생성일
  createdAt: string;
}

export const ResearchSchema = SchemaFactory.createForClass(Research);

export type ResearchDocument = Research & Document;
