import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import {
  ResearchParticipantInfo,
  ResearchParticipantInfoSchema,
} from "./Embedded";

/**
 * 리서치 참여 정보 스키마입니다. 리서치 기본 정보의 _id를 공유합니다.
 * @author 현웅
 */
@Schema()
export class ResearchParticipation {
  //? 앱단에 정보를 넘겨줄 때는 유저 _id를 넘겨줄 필요가 없고 숫자만 넘기면 되는데,
  //? 그 때마다 .length를 사용하여 넘겨주면 (아마도) 좋지 않기에 숫자만 따로 관리합니다.
  @Prop({ default: 0 }) // 조회 수
  viewedNum: number;

  @Prop({ default: 0 }) // 스크랩 수
  scrappedNum: number;

  @Prop({ default: 0 }) // 참여자 수
  participantNum: number;

  @Prop({ type: [String], default: [] }) // 조회한 유저 _id
  viewedUserIds: string[];

  @Prop({ type: [String], default: [] }) // 스크랩한 유저 _id
  scrappedUserIds: string[];

  @Prop({ type: [ResearchParticipantInfoSchema], default: [] }) // 참여한 유저
  participantInfos: ResearchParticipantInfo[];
}

export const ResearchParticipationSchema = SchemaFactory.createForClass(
  ResearchParticipation,
);

export type ResearchParticipationDocument = ResearchParticipation & Document;
