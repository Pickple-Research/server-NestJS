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
  @Prop({ type: [String], default: [] }) // 조회한 유저 _id
  viewedUserIds: string[];

  @Prop({ type: [String], default: [] }) // 스크랩한 유저 _id
  scrappedUserIds: string[];

  @Prop({ type: [ResearchParticipantInfoSchema], default: [] }) // 참여한 유저
  participantInfos: ResearchParticipantInfo[];

  @Prop({ type: [String], default: [] }) // 댓글 _id
  commentIds: string[];
}

export const ResearchParticipationSchema = SchemaFactory.createForClass(
  ResearchParticipation,
);

export type ResearchParticipationDocument = ResearchParticipation & Document;
