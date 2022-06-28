import { Injectable, Inject } from "@nestjs/common";
import { ClientSession } from "mongoose";
import { MongoUserFindService, MongoUserDeleteService } from "src/Mongo";
import { UserNotFoundException } from "src/Exception";

@Injectable()
export class UserDeleteService {
  constructor() {}

  @Inject() private readonly mongoUserFindService: MongoUserFindService;
  @Inject() private readonly mongoUserDeleteService: MongoUserDeleteService;

  /**
   * 인자로 받은 _id를 사용하는 유저의 데이터를 삭제합니다.
   * 해당 유저가 존재하지 않는다면, 에러를 반환합니다.
   * @author 현웅
   */
  async deleteUserById(param: { userId: string }, session: ClientSession) {
    if (!(await this.mongoUserFindService.getUserById(param.userId))) {
      throw new UserNotFoundException();
    }

    // return await this.mongoUserDeleteService.deleteUserById({userId: param.userId});
  }
}
