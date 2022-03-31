import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserController } from "../Controller";
import { UserService } from "../Service";
import { MongoUserService } from "../Mongo";
import { User, UserSchema, UserActivity, UserActivitySchema } from "../Schema";

/**
 * 유저 정보를 관리합니다. (회원가입, 정규유저 전환과 로그인 기능은 auth module이 담당합니다.)
 * @author 현웅
 */
@Module({
  //? controllers: Module이 사용하는 Controller 명시
  //? providers: Module이 사용하는 Service, Strategy 명시
  //? imports: Module이 사용하는 또 다른 Module을 명시하고 설정
  //? exports: Module이 사용하는 provider 중 다른 모듈에서도 사용하는 provider 명시
  controllers: [UserController],
  providers: [UserService, MongoUserService],
  imports: [
    //? UserModule에서 사용되는 MongoDB Schema들을 설정합니다.
    //? 이 부분을 정의할 떄 MongoDB에 실제로 Collection이 생성됩니다.
    MongooseModule.forFeature(
      [
        { name: User.name, schema: UserSchema },
        { name: UserActivity.name, schema: UserActivitySchema },
      ],
      "user",
    ),
  ],
  exports: [UserService],
})
export class UserModule {}
