import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { ResearchComment } from "..";
import { ResearchEstimatedTime } from "../../Enum";

export type ResearchDocument = Research & Document;

@Schema()
export class Research {
  // #Independent Prop :
  @Prop({ required: true }) // 작성자 id
  userId: string;

  @Prop({ required: true }) // 리서치 제목
  title: string;

  @Prop({ required: true }) // 리서치 소개
  content: string;

  @Prop({ required: true }) // 리서치 진행자
  researcherName: string;

  @Prop({ required: true }) // 리서치 진행자 개요
  researcherInfo: string;

  @Prop({ required: true }) // 설문 url
  url: string;

  @Prop({ required: true }) // 설문 대상 개요 // TODO (enum화?)
  target: string;

  @Prop() // 상품 개요
  prize: string;

  @Prop({ type: [String], default: [] }) // 상품 url
  prizeUrls: string[];

  @Prop() // 작성자 레벨
  userLevel: number;

  @Prop({ default: 30 }) // 목표 참여자 수
  goalParticipant: number;

  @Prop() // 상품 추첨 인원
  prizeTaker: number;

  @Prop({ default: 0 }) // 기간 연장 횟수
  extended: number;

  @Prop({ default: 0 }) // 나눠줄 credit
  credit: number;

  @Prop({ default: 0 }) // credit 받는 사람 수
  numCredit: number;

  @Prop({ default: false }) // 경품 유무
  offerPrize: boolean;

  @Prop({ default: false }) // 숨김 여부
  hide: boolean;

  @Prop({ default: true }) // 익명 진행
  annonymous: boolean;

  @Prop({ enum: ResearchEstimatedTime }) // 소요 시간
  estimatedTime: ResearchEstimatedTime;

  @Prop() // 생성 날짜
  createdAt: Date;

  @Prop() // 리서치 종료 날짜
  deadline: Date;

  // #Referencing Prop (참조하는 스키마의 id만 저장) :
  @Prop({ type: [String], default: [] }) // 조회한 유저 id
  viewedUserIds: string[];

  @Prop({ type: [String], default: [] }) // 참여한 유저 id
  participatedUserIds: string[];

  @Prop({ type: [String], default: [] }) // 핀한 유저 id
  pinnedUserIds: string[];

  // #Partial Embedded Prop (참조하는 스키마 정보의 일부만 떼어내 저장) :

  // #Fully Embedded Prop (참조하는 스키마 정보를 모두 저장) :
  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: "ResearchComment" }],
    default: [],
  }) // 댓글 리스트
  comments: ResearchComment[];
}

export const ResearchSchema = SchemaFactory.createForClass(Research);
