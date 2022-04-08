import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthController } from "../Controller";
import { AuthService } from "../Service";
import {
  MongoUserCreateService,
  MongoUserDeleteService,
  MongoUserFindService,
} from "../Mongo";
import {
  User,
  UserSchema,
  UserActivity,
  UserActivitySchema,
  UnauthorizedUser,
  UnauthorizedUserSchema,
} from "../Schema";
import { MONGODB_USER_CONNECTION } from "../Constant";

/**
 * 회원가입, 정규유저 전환, 로그인 기능을 담당합니다.
 * @author 현웅
 */
@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    MongoUserCreateService,
    MongoUserDeleteService,
    MongoUserFindService,
  ],
  imports: [
    //? authService에서 jwtService를 사용하고 있으므로 imports에 포함시킵니다
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    MongooseModule.forFeature(
      [
        { name: User.name, schema: UserSchema },
        { name: UserActivity.name, schema: UserActivitySchema },
        { name: UnauthorizedUser.name, schema: UnauthorizedUserSchema },
      ],
      MONGODB_USER_CONNECTION,
    ),
  ],
})
export class AuthModule {}
