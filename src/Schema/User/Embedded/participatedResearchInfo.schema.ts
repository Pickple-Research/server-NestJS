import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

/**
 * (유저가) 참여한 리서치에 대한 정보 스키마입니다.
 * userActivity에서만 사용되는 임베드 스키마이므로 _id를 필요로 하지 않습니다.
 * @author 현웅
 */
@Schema({ _id: false })
export class ParticipatedResearchInfo {
  @Prop() // 참여한 리서치의 _id
  researchId: string;

  @Prop() // 참여 시각
  participatedAt: string;
}

export const ParticipatedResearchInfoSchema = SchemaFactory.createForClass(
  ParticipatedResearchInfo,
);
