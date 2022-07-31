import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ClientSession } from "mongoose";
import {
  CreditHistory,
  CreditHistoryDocument,
  UnauthorizedUser,
  UnauthorizedUserDocument,
  User,
  UserDocument,
  UserNotice,
  UserNoticeDocument,
  UserPrivacy,
  UserPrivacyDocument,
  UserProperty,
  UserPropertyDocument,
  UserResearch,
  UserResearchDocument,
  UserSecurity,
  UserSecurityDocument,
  UserVote,
  UserVoteDocument,
} from "src/Schema";

@Injectable()
export class MongoUserDeleteService {
  constructor(
    // 서비스에서 사용할 스키마
    @InjectModel(CreditHistory.name)
    private readonly CreditHistory: Model<CreditHistoryDocument>,
    @InjectModel(UnauthorizedUser.name)
    private readonly UnauthorizedUser: Model<UnauthorizedUserDocument>,
    @InjectModel(User.name) private readonly User: Model<UserDocument>,
    @InjectModel(UserNotice.name)
    private readonly UserNotice: Model<UserNoticeDocument>,
    @InjectModel(UserPrivacy.name)
    private readonly UserPrivacy: Model<UserPrivacyDocument>,
    @InjectModel(UserProperty.name)
    private readonly UserProperty: Model<UserPropertyDocument>,
    @InjectModel(UserResearch.name)
    private readonly UserResearch: Model<UserResearchDocument>,
    @InjectModel(UserSecurity.name)
    private readonly UserSecurity: Model<UserSecurityDocument>,
    @InjectModel(UserVote.name)
    private readonly UserVote: Model<UserVoteDocument>,
  ) {}

  /**
   * _id 를 통해 이메일 미인증 유저 데이터를 삭제합니다.
   * @author 현웅
   */

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
   * 인자로 받은 _id를 사용하는 유저의 모든 데이터를 삭제합니다.
   * UserPrivacy, UserResearch, UserVote 및 크레딧 내역을 모두 삭제하되,
   * UserProperty는 데이터 분석을 위해 남겨둡니다.
   * @author 현웅
   */
  async deleteUserById(param: { userId: string }, session: ClientSession) {
    await this.User.findByIdAndDelete(param.userId, { session });
    await this.UserNotice.findByIdAndDelete(param.userId, { session });
    await this.UserPrivacy.findByIdAndDelete(param.userId, { session });
    await this.UserResearch.findByIdAndDelete(param.userId, { session });
    await this.UserSecurity.findByIdAndDelete(param.userId, { session });
    await this.UserVote.findByIdAndDelete(param.userId, { session });
    await this.CreditHistory.deleteMany({ userId: param.userId }, { session });
    // await this.Notification.deleteMany(
    //   { userId: param.userId },
    //   { session },
    // );
  }
}
