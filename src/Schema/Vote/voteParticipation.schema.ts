import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * 투표 참여 정보 스키마입니다. 투표 기본 정보의 _id를 공유합니다.
 * @author 현웅
 */
@Schema()
export class VoteParticipation {
  @Prop({ type: [String], default: [] }) // 참여한 유저 _id
  participantIds: string[];
}

export const VoteParticipationSchema =
  SchemaFactory.createForClass(VoteParticipation);

export type VoteParticipationDocument = VoteParticipation & Document;
