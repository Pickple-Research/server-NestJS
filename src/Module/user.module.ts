import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserController } from "../Controller";
import { UserService } from "../Service";
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
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
