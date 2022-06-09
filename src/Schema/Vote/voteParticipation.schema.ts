import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { VoteParticipantInfo, VoteParticipantInfoSchema } from "./Embedded";

/**
 * 투표 참여 정보 스키마입니다. 투표 기본 정보의 _id를 공유합니다.
 * @author 현웅
 */
@Schema()
export class VoteParticipation {
  @Prop({ type: [VoteParticipantInfoSchema], default: [] }) // 참여한 유저 정보
  participantInfos: VoteParticipantInfo[];

  @Prop({ type: [String], default: [] }) // 스크랩한 유저 _id
  scrappedUserIds: string[];

  @Prop({ type: [Number] }) // 투표 결과. 각 인덱스의 값은 투표 선택지가 얼마나 선택되었는지 알려줍니다.
  result: number[];
}

export const VoteParticipationSchema =
  SchemaFactory.createForClass(VoteParticipation);

export type VoteParticipationDocument = VoteParticipation & Document;
