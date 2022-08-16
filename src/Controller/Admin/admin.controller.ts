import { Controller, Inject, Request, Body, Post } from "@nestjs/common";
import { FirebaseService } from "src/Firebase";
import { MongoUserFindService, MongoUserUpdateService } from "src/Mongo";
import { JwtUserInfo } from "src/Object/Type";

import { Public } from "src/Security/Metadata";

/**
 * 관리자만 사용하는 기능 컨트롤러입니다.
 * 푸쉬 알람 전송, 유저 정보 수정, 리서치/투표 블록 및 삭제 기능을 담당합니다.
 * @author 현웅
 */
@Controller("admin")
export class AdminController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Inject() private readonly mongoUserFindService: MongoUserFindService;
  @Inject() private readonly mongoUserUpdateService: MongoUserUpdateService;

  @Public()
  @Post("alarm")
  async sendPushAlarm() {
    return this.firebaseService.sendPushAlarm();
  }
}
