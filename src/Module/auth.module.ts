import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthController } from "../Controller";
import { AuthService } from "../Service";
import { MongoUserService } from "../Mongo";
import { User, UserSchema, UserActivity, UserActivitySchema } from "../Schema";

/**
 * 회원가입, 정규유저 전환, 로그인 기능을 담당합니다.
 * @author 현웅
 */
@Module({
  controllers: [AuthController],
  providers: [AuthService, MongoUserService],
  imports: [
    //? authService에서 jwtService를 사용하고 있으므로 imports에 포함시킵니다
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    MongooseModule.forFeature(
      [
        { name: User.name, schema: UserSchema },
        { name: UserActivity.name, schema: UserActivitySchema },
      ],
      "user",
    ),
  ],
})
export class AuthModule {}
