import { Injectable } from "@nestjs/common";
import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { Model, Connection } from "mongoose";
import {
  UnauthorizedUser,
  UnauthorizedUserDocument,
  User,
  UserDocument,
  UserActivity,
  UserActivityDocument,
  UserCreditHistory,
  UserCreditHistoryDocument,
  UserPrivacy,
  UserPrivacyDocument,
  UserProperty,
  UserPropertyDocument,
} from "src/Schema";
import { MongoUserFindService } from "./mongo.user.find.service";
import { UserNotFoundException } from "src/Exception";
import { tryTransaction } from "src/Util";
import { MONGODB_USER_CONNECTION } from "src/Constant";

@Injectable()
export class MongoUserDeleteService {
  constructor(
    // 서비스에서 사용할 스키마
    @InjectModel(UnauthorizedUser.name)
    private readonly UnauthorizedUser: Model<UnauthorizedUserDocument>,
    @InjectModel(User.name) private readonly User: Model<UserDocument>,
    @InjectModel(UserActivity.name)
    private readonly UserActivity: Model<UserActivityDocument>,
    @InjectModel(UserCreditHistory.name)
    private readonly UserCreditHistory: Model<UserCreditHistoryDocument>,
    @InjectModel(UserPrivacy.name)
    private readonly UserPrivacy: Model<UserPrivacyDocument>,
    @InjectModel(UserProperty.name)
    private readonly UserProperty: Model<UserPropertyDocument>,

    // 사용하는 DB 연결 인스턴스 (session 만드는 용도)
    @InjectConnection(MONGODB_USER_CONNECTION)
    private readonly connection: Connection,

    // 추가로 사용하는 서비스
    private readonly mongoUserFindService: MongoUserFindService,
  ) {}

  /**
   * 이메일 미인증 유저 데이터를 삭제합니다.
   * @author 현웅
   */
  async deleteUnauthorizedUser(email: string) {
    return "deleted!";
  }

  /**
   * 인자로 받은 _id를 사용하는 유저의 데이터를 삭제합니다.
   * Activity, CreditHistory, Privacy 도 같이 삭제합니다.
   * (Property는 데이터 분석을 위해 남겨둡니다)
   * @author 현웅
   */
  async deleteUserById(_id: string) {
    const session = await this.connection.startSession();

    //TODO: #QUERY-EFFICIENCY #CREATE/DELETE-MANY (해당 해쉬태그로 모두 찾아서 바꿀 것)
    return await tryTransaction(async () => {
      await this.User.findOneAndDelete({ _id }, session);
      await this.UserActivity.findOneAndDelete({ _id }, session);
      await this.UserCreditHistory.findOneAndDelete({ _id }, session);
      await this.UserPrivacy.findOneAndDelete({ _id }, session);
    }, session);
  }
}
