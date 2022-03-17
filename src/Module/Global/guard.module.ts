import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { EmailAuthGuard, JwtAuthGuard } from "../../Security/Guard";

/**
 * 전역으로 적용되는 Guard들을 모듈화한 클래스입니다.
 * @author 현웅
 */
@Module({
  providers: [
    // {
    //   provide: APP_GUARD,
    //   useClass: EmailAuthGuard,
    // },
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
  ],
})
export class GuardModule {}
