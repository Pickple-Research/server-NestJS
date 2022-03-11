import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { JWTStrategy, LocalStrategy } from "../Security/Strategy";
import { UserController } from "../Controller";
import { UserService } from "../Service";
import { MongoUserService } from "../Mongo";
import {
  User,
  UserSchema,
  UserNotification,
  UserNotificationSchema,
  UserDetailedInfo,
  UserDetailedInfoSchema,
} from "../Schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserNotification.name, schema: UserNotificationSchema },
      {
        name: UserDetailedInfo.name,
        schema: UserDetailedInfoSchema,
      },
    ]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "60s" },
    }),
  ],
  controllers: [UserController],
  providers: [UserService, MongoUserService, JWTStrategy, LocalStrategy],
  exports: [UserService],
})
export class UserModule {}
