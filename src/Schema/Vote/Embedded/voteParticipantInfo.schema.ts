import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

/**
 * 투표에 참여한 유저 정보 스키마
 * @param userId 참여한 유저 _id
 * @param selectedOptionIndexes 선택한 선택지 index들
 * @param participatedAt 투표에 참여한 시각
 * @author 현웅
 */
@Schema({ _id: false })
export class VoteParticipantInfo {
  @Prop({ required: true }) // 참여한 유저 _id
  userId: string;

  @Prop({ required: true, type: [Number], default: [] }) // 선택한 선택지 index들
  selectedOptionIndexes: number[];

  @Prop({ required: true }) // 투표에 참여한 시각
  participatedAt: string;
}

export const VoteParticipantInfoSchema =
  SchemaFactory.createForClass(VoteParticipantInfo);
