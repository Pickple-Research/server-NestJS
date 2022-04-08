import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MongoUserCreateService } from "./mongo.user.create.service";
import { MongoUserDeleteService } from "./mongo.user.delete.service";
import { MongoUserFindService } from "./mongo.user.find.service";
import {
  User,
  UserSchema,
  UnauthorizedUser,
  UnauthorizedUserSchema,
} from "../../Schema";
import { MONGODB_USER_CONNECTION } from "../../Constant";

@Module({
  providers: [
    MongoUserCreateService,
    MongoUserDeleteService,
    MongoUserFindService,
  ],
  imports: [
    //? MongoUserModule에서 연결하고 사용할 DB와 Schema를 설정합니다.
    //?   이 부분을 정의할 떄 DB에 Schema에 기반한 Collection이 생성됩니다.
    //? MongoUser[method]Service를 Module로 묶지 않고 각각의 Service를 일일이 import 해서 사용하는 경우,
    //?   아래 코드를 import한 모듈마다 새로 정의해야 하므로 번거로워지고 복잡해집니다.
    MongooseModule.forFeature(
      [
        { name: User.name, schema: UserSchema },
        { name: UnauthorizedUser.name, schema: UnauthorizedUserSchema },
      ],
      MONGODB_USER_CONNECTION,
    ),
  ],
  //? 이 모듈을 import한 모듈이 사용하는 Service가 아래의 service를 사용할 수 있도록 지정합니다.
  exports: [
    MongoUserCreateService,
    MongoUserDeleteService,
    MongoUserFindService,
  ],
})
export class MongoUserModule {}
