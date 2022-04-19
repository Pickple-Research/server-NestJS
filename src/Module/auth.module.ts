import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "../Controller";
import { AuthService } from "../Service";
import { MongoUserModule } from "../Mongo";

/**
 * 회원가입, 정규유저 전환, 로그인 기능을 담당합니다.
 * @author 현웅
 */
@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    MongoUserModule,
    //? authService에서 jwtService를 사용하고 있으므로 imports에 포함시킵니다
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
})
export class AuthModule {}
