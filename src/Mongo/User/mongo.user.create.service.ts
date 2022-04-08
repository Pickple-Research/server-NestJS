import { Injectable } from "@nestjs/common";
import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { Model, Connection } from "mongoose";
import { User, UserDocument } from "../../Schema";
import { AccountType, UserType } from "../../Object/Enum";
import { tryTransaction } from "../../Util";
import { MONGODB_USER_CONNECTION } from "../../Constant";

@Injectable()
export class MongoUserCreateService {
  constructor(
    @InjectModel(User.name) private readonly User: Model<UserDocument>,
    @InjectConnection(MONGODB_USER_CONNECTION)
    private readonly connection: Connection,
  ) {}

  /**
   * @Transaction
   * 새로운 유저를 생성합니다. UserProperty, UserActivity, UserPrivacy Document도 함께 만듭니다.
   * @author 현웅
   */
  async createNewUser() {
    const session = await this.connection.startSession();

    return await tryTransaction(session, async () => {
      return;
    });
  }
}
