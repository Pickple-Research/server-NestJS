import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
// Middlewares
import { BlankMiddleware } from "../Middleware";
// Global Modules
import {
  InterceptorModule,
  GuardModule,
  PipeModule,
  FilterModule,
} from "../Module/Global";
// Main Modules
import {
  AuthModule,
  FeedbackModule,
  GeneralModule,
  NoticeModule,
  ResearchModule,
  UserModule,
} from "../Module";

/**
 * NestJS에서 제공하는 기본 모듈과 서비스 제공을 위해 우리가 제작한 모든 모듈을 합치는 곳입니다.
 * 최종적으로 main.ts 함수에서 import한 후 서버를 실행합니다.
 * ***
 * 주요 기능:
 * - 환경 변수, DB 연결을 설정합니다.
 * - 전역으로 적용되는 Interceptor, Guard, Filter를 설정합니다.
 * - 전역으로 적용되는 Middleware의 적용 범위를 설정합니다.
 * ***
 * @author 현웅
 */
@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    //? ConfigModule: .env 변수를 사용할 수 있도록 도와주는 모듈. (내부적으로 dotenv를 사용)
    //? {isGlobal: true}: .env 변수를 전역에서 사용할 수 있도록 설정
    ConfigModule.forRoot({ isGlobal: true }),

    //? MongooseModule.forRoot: 인자로 받은 MongoDB URI에 연결
    MongooseModule.forRoot(process.env.MONGODB_ENDPOINT, {
      connectionName: "main",
    }),

    //* 전역 적용 모듈
    //* 참조 (NestJS Request Lifecycle): https://docs.nestjs.com/faq/request-lifecycle#request-lifecycle
    InterceptorModule,
    GuardModule,
    PipeModule,
    FilterModule,

    //* Controller & Service 형태의 일반 모듈
    AuthModule,
    FeedbackModule,
    GeneralModule,
    NoticeModule,
    ResearchModule,
    UserModule,
  ],
})
export class AppModule implements NestModule {
  configure() {}
  // //* 전역 미들웨어 설정을 하고 싶다면 아래 주석을 이용합니다.
  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply(BlankMiddleware)
  //     .exclude()
  //     .forRoutes({ path: "*", method: RequestMethod.ALL });
  // }
}
