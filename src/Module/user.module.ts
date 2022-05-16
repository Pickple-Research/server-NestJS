import { Module } from "@nestjs/common";
import {
  UserGetController,
  UserPostController,
  UserPatchController,
  UserDeleteController,
} from "src/Controller";
import {
  UserCreateService,
  UserFindService,
  UserDeleteService,
  ResearchUpdateService,
  PartnerUpdateService,
} from "src/Service";
import {
  MongoUserModule,
  MongoResearchModule,
  MongoPartnerModule,
} from "src/Mongo";

/**
 * 유저 정보를 관리합니다. (회원가입, 정규유저 전환과 로그인 기능은 auth module이 담당합니다.)
 * @author 현웅
 */
@Module({
  controllers: [
    UserGetController,
    UserPostController,
    UserPatchController,
    UserDeleteController,
  ],
  providers: [UserCreateService, UserFindService, UserDeleteService],
  imports: [MongoUserModule, MongoResearchModule, MongoPartnerModule],
})
export class UserModule {}
