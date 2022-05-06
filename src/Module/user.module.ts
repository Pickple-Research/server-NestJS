import { Module } from "@nestjs/common";
import {
  UserGetController,
  UserPostController,
  UserDeleteController,
} from "../Controller";
import {
  UserCreateService,
  UserFindService,
  UserDeleteService,
} from "../Service";
import { MongoUserModule } from "../Mongo";

/**
 * 유저 정보를 관리합니다. (회원가입, 정규유저 전환과 로그인 기능은 auth module이 담당합니다.)
 * @author 현웅
 */
@Module({
  controllers: [UserGetController, UserPostController, UserDeleteController],
  providers: [UserCreateService, UserFindService, UserDeleteService],
  imports: [MongoUserModule],
})
export class UserModule {}
