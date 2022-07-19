import { Injectable } from "@nestjs/common";
import admin from "firebase-admin";

@Injectable()
export class FirebaseService {
  constructor() {
    const serviceAccount = require("./r2c-pickpleresearch-firebase-adminsdk-7ykfc-8627d5f061.json");
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  /**
   * 인자로 주어진 내용을 푸쉬 알람 형태로 유저에게 전송합니다.
   *
   * @author 현웅
   */
  async sendPushAlarm(notification: { title: string; body: string }) {
    const message = {
      token:
        "f9oS6FhnTI2Z0c0PW68JxK:APA91bE_sFx8NDC9SBP0RgJb-tyZexI6t2XkrjEVNRhelksMCui_dE6MItRhoRZ4cvu2HqxKgD7gKDWDa1V9WfkyGOsc7fyhj_54ZtvM7pgUaWTIgo7A288XG3oAYd365LoPPernWtNK",
      notification: {
        title: "서버 공지 제목",
        body: "서버 공지 내용",
      },
    };

    const result = await admin.messaging().send(message);
  }
}
