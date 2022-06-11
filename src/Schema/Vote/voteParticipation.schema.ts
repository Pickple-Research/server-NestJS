import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { VoteParticipantInfo, VoteParticipantInfoSchema } from "./Embedded";

/**
 * 투표 참여 정보 스키마입니다. 투표 기본 정보의 _id를 공유합니다.
 * @author 현웅
 */
@Schema()
export class VoteParticipation {
  @Prop({ type: [String], default: [] }) // 조회한 유저 _id
  viewedUserIds: string[];

  @Prop({ type: [String], default: [] }) // 스크랩한 유저 _id
  scrappedUserIds: string[];

  @Prop({ type: [VoteParticipantInfoSchema], default: [] }) // 참여한 유저 정보
  participantInfos: VoteParticipantInfo[];

  @Prop({ type: [String], default: [] }) // 댓글 _id
  commentIds: string[];
}

export const VoteParticipationSchema =
  SchemaFactory.createForClass(VoteParticipation);

export type VoteParticipationDocument = VoteParticipation & Document;
