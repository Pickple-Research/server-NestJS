import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  User,
  UserDocument,
  UnauthorizedUser,
  UnauthorizedUserDocument,
} from "../../Schema";

@Injectable()
export class MongoUserDeleteService {
  constructor(
    @InjectModel(User.name) private readonly User: Model<UserDocument>,
    @InjectModel(UnauthorizedUser.name)
    private readonly UnauthorizedUser: Model<UnauthorizedUserDocument>,
  ) {}

  /**
   * 이메일 미인증 유저를 삭제합니다.
   * @author 현웅
   */
  async deleteUnauthorizedUser(email: string) {
    return "deleted!";
  }
}
