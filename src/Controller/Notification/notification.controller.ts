import { Body, Controller, Get, Post } from "@nestjs/common";
import { NotificationService } from "../../Service";
import { Notification } from "../../Schema";

@Controller("notification")
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // Get Requests
  // 테스트 API
  @Get("")
  async testNotificationRouter() {
    return await this.notificationService.testNotificationRouter();
  }
}
