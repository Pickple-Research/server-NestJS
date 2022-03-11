import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
// import { AppController } from "../Controller/app.controller";
// import { AppService } from "../Service/app.service";
// Middlewares
import { JWTParserMiddleware } from "../Middleware";
// Main Modules
import { BannerModule } from "./banner.module";
import { ContentModule } from "./content.module";
import { FeedbackModule } from "./feedback.module";
import { GeneralModule } from "./general.module";
// import { MessageModule } from "./message.module";
import { NoticeModule } from "./notice.module";
import { ResearchModule } from "./research.module";
import { SurveytipModule } from "./surveytip.module";
import { UserModule } from "./user.module";

@Module({
  imports: [
    // !# env
    // ConfigModule : .env 변수를 사용할 수 있도록 설정  *isGlobal : .env 변수 전역 사용
    ConfigModule.forRoot({ isGlobal: true }),
    // MongooseModule : forRoot에 지정된 주소의 MongoDB와 연결
    MongooseModule.forRoot(process.env.MONGODB_ENDPOINT),
    BannerModule,
    ContentModule,
    FeedbackModule,
    GeneralModule,
    //  MessageModule,
    NoticeModule,
    ResearchModule,
    SurveytipModule,
    UserModule,
  ],
})
export class AppModule implements NestModule {
  // 모든 라우터에서 JWTParserMiddleware를 거치고 처리되도록 설정
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JWTParserMiddleware)
      .forRoutes({ path: "*", method: RequestMethod.ALL });
  }
}
