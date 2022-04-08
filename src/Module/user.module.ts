import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserGetController, UserPostController } from "../Controller";
import {
  UserCreateService,
  UserDeleteService,
  UserFindService,
} from "../Service";
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
 * 유저 정보를 관리합니다. (회원가입, 정규유저 전환과 로그인 기능은 auth module이 담당합니다.)
 * @author 현웅
 */
@Module({
  //? controllers: Module이 사용하는 Controller 명시
  //? providers: Module이 사용하는 Service, Strategy 명시
  //? imports: Module이 사용하는 또 다른 Module을 명시하고 설정
  //? exports: Module이 사용하는 provider 중 다른 모듈에서도 사용하는 provider 명시
  controllers: [UserGetController, UserPostController],
  providers: [
    UserCreateService,
    UserFindService,
    UserDeleteService,

    MongoUserCreateService,
    MongoUserDeleteService,
    MongoUserFindService,
  ],
  imports: [
    //? UserModule에서 사용되는 Collection Schema, 연결될 DB을 설정합니다.
    //? 이 부분을 정의할 떄 DB에 실제로 Collection이 생성됩니다.
    MongooseModule.forFeature(
      [
        { name: User.name, schema: UserSchema },
        { name: UserActivity.name, schema: UserActivitySchema },
        { name: UnauthorizedUser.name, schema: UnauthorizedUserSchema },
      ],
      MONGODB_USER_CONNECTION,
    ),
  ],
  exports: [UserFindService],
})
export class UserModule {}
