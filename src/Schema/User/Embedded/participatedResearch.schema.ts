import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

/**
 * 참여한 리서치 정보 스키마입니다.
 * userActivity에서만 사용되는 임베드 스키마이므로 _id를 필요로 하지 않습니다.
 * @author 현웅
 */
@Schema({ _id: false })
export class ParticipatedResearchInfo {
  @Prop()
  _id: string;
}

export const ParticipatedResearchInfoSchema = SchemaFactory.createForClass(
  ParticipatedResearchInfo,
);
