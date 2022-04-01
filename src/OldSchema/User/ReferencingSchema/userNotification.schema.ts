import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

// Notification 형태 정의
@Schema()
class Notification {
  @Prop()
  title: string;

  @Prop()
  content: string;

  @Prop() // 이동하려는 게시글의 id
  post_id: string;

  @Prop()
  post_type: number;
  // 0: 설문
  // 1: 자유 게시판
  // 2: 경품
  // 3: 시작화면
  // 4: content
  // 5: 쪽지함
  // 6: 피드백

  @Prop({ default: false }) // 알림 확인 여부
  checked: boolean;

  @Prop()
  createdAt: Date;
}

const NotificationSchema = SchemaFactory.createForClass(Notification);

// 실제 생성되는 Collection
@Schema()
export class UserNotification {
  @Prop()
  userId: string;

  @Prop({ type: [NotificationSchema], default: [] })
  notification: Notification[];
}

export type UserNotificationDocument = UserNotification & Document;

export const UserNotificationSchema =
  SchemaFactory.createForClass(UserNotification);
