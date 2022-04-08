import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "../../Schema";
import { AccountType, UserType } from "../../Object/Enum";
import { UserNotFoundException } from "../../Exception";

@Injectable()
export class MongoUserFindService {
  constructor(
    @InjectModel(User.name) private readonly User: Model<UserDocument>,
  ) {}

  /**
   * 인자로 받은 이메일을 사용하는 유저를 찾고 반환합니다.
   * 존재하지 않는다면 null을 반환합니다.
   * @param email 이메일
   * @returns 유저 계정 정보
   * @author 현웅
   */
  async getUserByEmail(email: string) {
    const user = await this.User.findOne({
      email,
    })
      // .select({})
      .lean();
    if (user) return user;
    return null;
  }

  /**
   * 소셜로그인 유저를 찾고 반환합니다.
   * @author 현웅
   */
  async getUserById(id: string) {}
}
