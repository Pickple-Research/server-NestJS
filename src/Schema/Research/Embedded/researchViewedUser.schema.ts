import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

/**
 * 리서치를 조회한 유저 정보 스키마
 * @author 현웅
 */
@Schema({ _id: false })
export class ResearchViewedUserInfo {
  @Prop({ required: true }) // 조회한 유저 _id
  userId: string;

  @Prop({ required: true }) // 조회한 시간
  viewedAt: string;
}

export const ResearchViewedUserInfoSchema = SchemaFactory.createForClass(
  ResearchViewedUserInfo,
);
