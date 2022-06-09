import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

/**
 * 리서치에 참여한 유저 특성 정보 스키마
 * @author 현웅
 */
@Schema({ _id: false })
export class ResearchParticipantInfo {
  @Prop({ required: true }) // 참여한 유저 _id
  userId: string;

  @Prop({ required: true }) // 리서치 참여에 걸린 시간
  consumedTime: string;

  @Prop({ required: true }) // 리서치에 참여한 시각
  participatedAt: string;
}

export const ResearchParticipantInfoSchema = SchemaFactory.createForClass(
  ResearchParticipantInfo,
);
