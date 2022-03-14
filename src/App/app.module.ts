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
import {
  AuthModule,
  BannerModule,
  ContentModule,
  FeedbackModule,
  GeneralModule,
  // MessageModule,
  NoticeModule,
  ResearchModule,
  SurveytipModule,
  UserModule,
} from "../Module";

/**
 * NestJS에서 제공하는 기본 모듈과 서비스 제공을 위해 우리가 제작한 모든 모듈을 합치는 곳입니다.
 * 최종적으로 main.ts 함수에서 import하여 bootstrap합니다.
 * ***
 * 주요 기능:
 * - 환경 변수, DB 연결을 설정합니다.
 * - Middleware 적용 범위를 설정합니다.
 * ***
 * @author 현웅
 */
@Module({
  imports: [
    //? ConfigModule : .env 변수를 사용할 수 있도록 도와주는 모듈. (내부적으로 dotenv를 사용)
    //? {isGlobal: true} : .env 변수를 전역에서 사용할 수 있도록 설정
    ConfigModule.forRoot({ isGlobal: true }),

    //? MongooseModule : forRoot에 지정된 URI의 MongoDB와 연결
    MongooseModule.forRoot(process.env.MONGODB_ENDPOINT),

    //* 제작한 모듈들을 적용
    AuthModule,
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
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JWTParserMiddleware)
      .exclude()
      //? 모든 라우터에서 JWTParserMiddleware를 거치고 처리되도록 설정
      .forRoutes({ path: "*", method: RequestMethod.ALL });
  }
}
