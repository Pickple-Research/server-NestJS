import { Body, Controller, Get, Post, Put, Delete } from "@nestjs/common";
import { NotificationService } from "../../Service";
import { Notification } from "../../Schema";

@Controller("notification")
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // Put Requests
  // 알림 확인 업데이트
  @Put("check")
  async setNotificationChecked(@Body() body: { notification_id: string }) {
    return await this.notificationService.setNotificationChecked(
      body.notification_id,
    );
  }
}
