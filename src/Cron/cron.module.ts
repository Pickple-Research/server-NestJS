import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MongoUserFindService, MongoUserDeleteService } from "src/Mongo";
import {
  User,
  UserSchema,
  UnauthorizedUser,
  UnauthorizedUserSchema,
} from "../Schema";
import { MONGODB_USER_CONNECTION } from "../Constant";
import { CronService } from "./cron.service";

/**
 * 주기적으로 실행되는 CronJob Service를 모은 Module입니다.
 * app.module에서 import되어 주기적으로 실행됩니다.
 * @author 현웅
 */
@Module({
  providers: [CronService, MongoUserFindService, MongoUserDeleteService],
  imports: [
    MongooseModule.forFeature(
      [
        { name: User.name, schema: UserSchema },
        { name: UnauthorizedUser.name, schema: UnauthorizedUserSchema },
      ],
      MONGODB_USER_CONNECTION,
    ),
  ],
})
export class CronModule {}
