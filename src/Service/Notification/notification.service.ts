import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Notification, NotificationDocument } from "../../Schema";

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly Notification: Model<NotificationDocument>,
  ) {}

  // Put Requests
  // 알림 확인 업데이트
  async setNotificationChecked(notification_id: string) {
    return;
  }
}
