import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ScheduleModule } from "@nestjs/schedule";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
// Middlewares
import { BlankMiddleware } from "../Middleware";
// CronJobs
import { CronModule } from "../Cron";
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
  NoticeModule,
  PartnerModule,
  ResearchModule,
  UserModule,
  VoteModule,
} from "../Module";
import {
  MONGODB_USER_CONNECTION,
  MONGODB_RESEARCH_CONNECTION,
  MONGODB_VOTE_CONNECTION,
  MONGODB_NOTICE_CONNECTION,
  MONGODB_PARTNER_CONNECTION,
  MONGODB_FEEDBACK_CONNECTION,
} from "../Constant";

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
    //? ScheduleModule: CronJob/Timeouts/Intervals를 통한 TaskScheduling을 할 수 있도록 도와주는 모듈.
    ScheduleModule.forRoot(),
    CronModule,

    //? ConfigModule: .env 변수를 사용할 수 있도록 도와주는 모듈. (내부적으로 dotenv를 사용)
    //? { isGlobal: true }: .env 변수를 전역에서 사용할 수 있도록 설정 (process.env.{환경변수} 로 접근합니다)
    ConfigModule.forRoot({ isGlobal: true }),

    //? MongooseModule: Mongoose를 사용할 수 있도록 도와주는 모듈.
    //? forRoot의 인자로 받은 MongoDB URI에 연결합니다.
    //? 여러 개의 DB에 연결하는 경우 connectionName의 값으로 이름을 명시합니다.
    MongooseModule.forRoot(process.env.MONGODB_FEEDBACK_ENDPOINT, {
      connectionName: MONGODB_FEEDBACK_CONNECTION,
    }),
    MongooseModule.forRoot(process.env.MONGODB_NOTICE_ENDPOINT, {
      connectionName: MONGODB_NOTICE_CONNECTION,
    }),
    MongooseModule.forRoot(process.env.MONGODB_PARTNER_ENDPOINT, {
      connectionName: MONGODB_PARTNER_CONNECTION,
    }),
    MongooseModule.forRoot(process.env.MONGODB_RESEARCH_ENDPOINT, {
      connectionName: MONGODB_RESEARCH_CONNECTION,
    }),
    MongooseModule.forRoot(process.env.MONGODB_USER_ENDPOINT, {
      connectionName: MONGODB_USER_CONNECTION,
    }),
    MongooseModule.forRoot(process.env.MONGODB_VOTE_ENDPOINT, {
      connectionName: MONGODB_VOTE_CONNECTION,
    }),

    //* 전역 적용 모듈
    //* 참조 (NestJS Request Lifecycle): https://docs.nestjs.com/faq/request-lifecycle#request-lifecycle
    InterceptorModule,
    // GuardModule,
    PipeModule,
    FilterModule,

    //* Controller & Service 형태의 일반 모듈
    AuthModule,
    FeedbackModule,
    NoticeModule,
    PartnerModule,
    ResearchModule,
    UserModule,
    VoteModule,
  ],
})
export class AppModule implements NestModule {
  configure() {}
  //* 전역 미들웨어 설정을 하고 싶다면 아래 주석을 이용합니다.
  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply(BlankMiddleware)
  //     .exclude()
  //     //? path: 경로 지정  method: HTTP method 지정
  //     .forRoutes({ path: "*", method: RequestMethod.ALL });
  // }
}
