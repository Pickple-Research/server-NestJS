import { Injectable } from "@nestjs/common";
import admin from "firebase-admin";
// import * as account from "./r2c-pickpleresearch-firebase-adminsdk-7ykfc-8627d5f061.json";
import { TokenMessage } from "firebase-admin/lib/messaging/messaging-api";

@Injectable()
export class FirebaseService {
  constructor() {
    //! 왠진 모르겠지만 아래처럼 require로 가져오면 에러가 납니다. import 로 가져옵시다.
    // const serviceAccount = require("./r2c-pickpleresearch-firebase-adminsdk-7ykfc-8627d5f061.json");
    // if (admin.apps.length === 0) {
    //   admin.initializeApp({
    //     credential: admin.credential.cert(account as any),
    //   });
    // } else {
    //   admin.app();
    // }
  }

  /**
   * 인자로 주어진 내용을 푸쉬 알람 형태로 유저에게 전송합니다.
   * @author 현웅
   */
  async sendPushAlarm() {
    const message = {
      token:
        "dm5Wo57tkU2hoUcga8YfeT:APA91bHfnJ6Ygaj39aOSM89I5Z4TpoNSVYJmzRvmTQF2WQM2XOK0saxAWNsRDmeoI5m7G-txyjqbA4Xq866I-BD0XzDogHneayyAmqRE1NltFx6dJzjIOl9dwtYIZU9hYzRI0SWMWABK",
      notification: {
        title: "서버 공지 제목",
        body: "서버 공지 내용",
      },
    };

    const result = await admin.messaging().send(message);
  }

  /**
   * 여러 개의 푸시 알림을 전송합니다.
   * @author 현웅
   */
  async sendMultiplePushAlarm(messages: TokenMessage[]) {
    try {
      return await admin.messaging().sendAll(messages);
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
