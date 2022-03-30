import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthController } from "../Controller";
import { AuthService } from "../Service";
import { MongoUserService } from "../Mongo";
import {
  User,
  UserSchema,
  UserNotification,
  UserNotificationSchema,
  UserDetailedInfo,
  UserDetailedInfoSchema,
} from "../OldSchema";

/**
 * 회원가입, 정규유저 전환, 로그인 기능을 담당합니다.
 * @author 현웅
 */
@Module({
  controllers: [AuthController],
  //? Auth Module내의 Guard들이 사용하는 Strategy들도 providers에 포함시킵니다.
  providers: [AuthService, MongoUserService],
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "60s" },
    }),
    MongooseModule.forFeature(
      [
        { name: User.name, schema: UserSchema },
        { name: UserNotification.name, schema: UserNotificationSchema },
        {
          name: UserDetailedInfo.name,
          schema: UserDetailedInfoSchema,
        },
      ],
      "main",
    ),
  ],
})
export class AuthModule {}
