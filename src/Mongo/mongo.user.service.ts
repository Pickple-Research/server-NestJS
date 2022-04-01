import { Injectable } from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { Model, Connection, ClientSession } from "mongoose";
import { User, UserDocument } from "../Schema";
import { UserSignupDto } from "../Dto";
import { AccountType, UserType } from "../Object/Enum";
import { tryTransaction } from "../Util";
import { UserNotFoundException } from "../Exception";
import { MONGODB_USER_CONNECTION } from "../Constant";

@Injectable()
export class MongoUserService {
  constructor(
    @InjectModel(User.name) private readonly User: Model<UserDocument>,
    @InjectConnection(MONGODB_USER_CONNECTION)
    private readonly connection: Connection,
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
    }).lean();
    if (user) return user;
    return null;
  }

  /**
   * 소셜로그인 유저를 찾고 반환합니다.
   * @author 현웅
   */
  async getUserById() {}

  /**
   * 새로운 User Data를 만듭니다. UserProperty, UserActivity, UserPrivacy Document도 함께 만듭니다.
   * @author 현웅
   */
  async createNewUser() {
    const session = await this.connection.startSession();

    return await tryTransaction(session, async () => {
      return;
    });
  }
}
