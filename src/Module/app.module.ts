import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
// import { AppController } from "../Controller/app.controller";
// import { AppService } from "../Service/app.service";
import { BannerModule } from "./banner.module";
import { ContentModule } from "./content.module";
import { FeedbackModule } from "./feedback.module";
import { GeneralModule } from "./general.module";
// import {MessageModule} from "./message.module";
import { NoticeModule } from "./notice.module";
import { NotificationModule } from "./notification.module";
import { PostModule } from "./post.module";
import { SurveytipModule } from "./surveytip.module";
import { UserModule } from "./user.module";

@Module({
  imports: [
    // ConfigModule : .env 변수 사용  *isGlobal : .env 변수 전역적 사용
    ConfigModule.forRoot({ isGlobal: true }),
    // MongooseModule : forRoot에 지정된 주소의 MongoDB와 연결
    MongooseModule.forRoot(process.env.MONGODB_ENDPOINT),
    BannerModule,
    ContentModule,
    FeedbackModule,
    GeneralModule,
    //  MessageModule,
    NoticeModule,
    NotificationModule,
    PostModule,
    SurveytipModule,
    UserModule,
  ],
  // controllers: [AppController],
  // providers: [AppService],
})
export class AppModule {}
