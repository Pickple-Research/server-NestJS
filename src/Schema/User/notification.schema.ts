import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * 유저별 알림 스키마입니다.
 * @author 현웅
 */
@Schema()
export class Notification {
  @Prop({ required: true }) // 알림 대상 유저
  userId: string;

  @Prop({ required: true }) // 알림 타입
  type: string;

  @Prop({ required: true }) // 알림 제목
  title: string;

  @Prop({ required: true }) // 알림 내용
  content: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

export type NotificationDocument = Notification & Document;
