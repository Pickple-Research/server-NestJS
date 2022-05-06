import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

/**
 * 리서치를 스크랩한 유저 정보 스키마
 * @author 현웅
 */
@Schema({ _id: false })
export class ResearchScrappedUserInfo {
  @Prop({ required: true }) // 스크랩한 유저 _id
  userId: string;

  @Prop({ required: true }) // 스크랩한 시간
  scrappedAt: string;
}

export const ResearchScrappedUserInfoSchema = SchemaFactory.createForClass(
  ResearchScrappedUserInfo,
);
