import { Injectable } from "@nestjs/common";
import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { Model, Connection, ClientSession } from "mongoose";
import {
  CreditHistory,
  CreditHistoryDocument,
  UnauthorizedUser,
  UnauthorizedUserDocument,
  User,
  UserDocument,
  UserCredit,
  UserCreditDocument,
  UserPrivacy,
  UserPrivacyDocument,
  UserProperty,
  UserPropertyDocument,
  UserResearch,
  UserResearchDocument,
  UserVote,
  UserVoteDocument,
} from "src/Schema";
import { MONGODB_USER_CONNECTION } from "src/Constant";

@Injectable()
export class MongoUserDeleteService {
  constructor(
    // 서비스에서 사용할 스키마
    @InjectModel(CreditHistory.name)
    private readonly CreditHistory: Model<CreditHistoryDocument>,
    @InjectModel(UnauthorizedUser.name)
    private readonly UnauthorizedUser: Model<UnauthorizedUserDocument>,
    @InjectModel(User.name) private readonly User: Model<UserDocument>,
    @InjectModel(UserCredit.name)
    private readonly UserCredit: Model<UserCreditDocument>,
    @InjectModel(UserPrivacy.name)
    private readonly UserPrivacy: Model<UserPrivacyDocument>,
    @InjectModel(UserProperty.name)
    private readonly UserProperty: Model<UserPropertyDocument>,
    @InjectModel(UserResearch.name)
    private readonly UserResearch: Model<UserResearchDocument>,
    @InjectModel(UserVote.name)
    private readonly UserVote: Model<UserVoteDocument>,

    // 사용하는 DB 연결 인스턴스 (session 만드는 용도)
    @InjectConnection(MONGODB_USER_CONNECTION)
    private readonly connection: Connection,
  ) {}

  /**
   * 이메일 미인증 유저 데이터를 삭제합니다.
   * @author 현웅
   */
  async deleteUnauthorizedUser(
    param: { email: string },
    session: ClientSession,
  ) {
    await this.UnauthorizedUser.findOneAndDelete(
      { email: param.email },
      { session },
    );
  }

  /**
   * 인자로 받은 _id를 사용하는 유저의 데이터를 삭제합니다.
   * UserPrivacy, UserResearch, UserVote 및 크레딧 내역을 모두 삭제하되,
   * UserProperty는 데이터 분석을 위해 남겨둡니다.
   * @author 현웅
   */
  async deleteUserById(param: { userId: string }, session: ClientSession) {
    await this.User.findByIdAndDelete(param.userId, { session });
    await this.UserPrivacy.findByIdAndDelete(param.userId, { session });
    await this.UserResearch.findByIdAndDelete(param.userId, { session });
    await this.UserVote.findByIdAndDelete(param.userId, { session });
    //* 크레딧 변동 내역 삭제
    const creditHistories = await this.UserCredit.findByIdAndDelete(
      param.userId,
      { session },
    )
      .select({ creditHistoryIds: 1 })
      .lean();
    await this.CreditHistory.deleteMany(
      { _id: { $in: creditHistories.creditHistoryIds } },
      { session },
    );
  }
}
