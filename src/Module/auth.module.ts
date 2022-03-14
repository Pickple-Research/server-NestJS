import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "../Controller";
import { AuthService } from "../Service";

/**
 * 회원가입, 정규유저 전환, 로그인 기능을 담당합니다.
 * @author 현웅
 */
@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "60s" },
    }),
  ],
})
export class AuthModule {}
