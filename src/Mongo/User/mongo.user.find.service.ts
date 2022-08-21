import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
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
  UserSecurity,
  UserSecurityDocument,
} from "src/Schema";
import {
  EmailDuplicateException,
  NicknameDuplicateException,
  UserNotFoundException,
  EmailNotAuthorizedException,
} from "src/Exception";

@Injectable()
export class MongoUserFindService {
  constructor(
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
    @InjectModel(UserSecurity.name)
    private readonly UserSecurity: Model<UserSecurityDocument>,
  ) {}

  /**
   * _id, 혹은 email 인자를 받아 해당 조건에 맞는 User 정보를 찾고 반환합니다.
   * selectQuery 를 이용하여 원하는 속성만 골라 반환할 수도 있습니다.
   * 조건에 맞는 User 정보가 없는 경우 null 을 반환합니다.
   * @author 현웅
   */
  async getUser(
    param:
      | { userId: string; selectQuery?: Partial<Record<keyof User, boolean>> }
      | {
          userEmail: string;
          selectQuery?: Partial<Record<keyof User, boolean>>;
        },
  ) {
    if ("userId" in param) {
      const user = await this.User.findById(
        param.userId,
        param.selectQuery,
      ).lean();
      if (user) return user;
      return null;
    }

    const user = await this.User.findOne(
      { email: param.userEmail },
      param.selectQuery,
    ).lean();
    if (user) return user;
    return null;
  }

  /**
   * 인자로 받은 userId 를 사용하는 유저들의 정보를 반환합니다.
   * selectQuery 를 통해 원하는 속성만 골라 반환할 수도 있습니다.
   * @author 현웅
   */
  async getUsersById(param: {
    userIds: string[];
    selectQuery?: Partial<Record<keyof User, boolean>>;
  }) {
    return await this.User.find(
      { _id: { $in: param.userIds } },
      param.selectQuery,
    ).lean();
  }

  /**
   * 이메일이 인증되지 않은 모든 미인증 유저들의 정보를 반환합니다.
   * @author 현웅
   */
  async getAllUnauthorizedUser(param: {
    selectQuery?: Partial<Record<keyof UnauthorizedUser, boolean>>;
  }) {
    return await this.UnauthorizedUser.find({ authorized: false })
      .select(param.selectQuery)
      .lean();
  }

  /**
   * 주어진 이메일을 사용하는 유저의 _id 를 반환합니다
   * @author 현웅
   */
  async getUserIdByEmail(email: string) {
    const user = await this.User.findOne({ email }).select({ _id: 1 }).lean();
    if (!user) throw new UserNotFoundException();
    return user._id;
  }

  /**
   * 인자로 받은 이메일로 가입된 정규 유저가 있는지 확인하고
   * 이미 존재한다면, 에러를 발생시킵니다.
   * @author 현웅
   */
  async checkEmailDuplicated(email: string) {
    const user = await this.User.findOne({ email }).lean();
    if (user) throw new EmailDuplicateException();
    return;
  }

  /**
   * 인자로 받은 닉네임으로 가입된 정규 유저가 있는지 확인하고
   * 이미 존재한다면, 에러를 발생시킵니다.
   * @author 현웅
   */
  async checkNicknameDuplicated(nickname: string) {
    const user = await this.User.findOne({ nickname })
      .select({ _id: 1 })
      .lean();
    if (user) throw new NicknameDuplicateException();
    return;
  }

  /**
   * 정규유저를 만들기 전, 인자로 주어진 이메일이 인증된 상태인지 확인합니다.
   * 인증되어 있지 않은 경우 에러를 일으킵니다.
   * @author 현웅
   */
  async checkEmailAuthorized(param: { email: string }) {
    const user = await this.UnauthorizedUser.findOne({ email: param.email })
      .select({ authorized: 1 })
      .lean();
    if (!user || !user.authorized) throw new EmailNotAuthorizedException();
    return;
  }

  /**
   * 주이진 userId 를 사용하는 유저 데이터를 반환합니다.
   * (UserPrivacy와 UserSecurity는 제외하고 반환)
   * @author 현웅
   */
  async getUserInfoById(userId: string) {
    const user = this.User.findById(userId).lean();
    const userNotice = this.UserNotice.findById(userId).lean();
    const userProperty = this.UserProperty.findById(userId).lean();

    return await Promise.all([user, userNotice, userProperty]).then(
      //* [user, userNotice, ...] 형태였던 반환값을 {user, userNotice, ...} 형태로 바꿔줍니다.
      ([user, userNotice, userProperty]) => {
        return {
          user,
          userNotice,
          userProperty,
        };
      },
    );
  }

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
      .select({ _id: 1 })
      .lean();

    if (user) return user;
    return null;
  }

  /**
   * 주이진 userId 를 사용하는 유저 데이터를 반환합니다.
   * (UserPrivacy 와 UserSecurity 는 제외하고 반환)
   * @author 현웅
   */
  async getUserInfoByEmail(email: string) {
    const user = await this.User.findOne({ email }).select({ _id: 1 }).lean();

    if (user) return await this.getUserInfoById(user._id);
    //* 유저가 존재하지 않는 경우엔 로직상 다른 곳에서 Exception 을 일으키므로 여기선 발생시키지 않습니다.
  }

  /**
   * 인자로 받은 닉네임을 사용하는 유저를 찾고 반환합니다.
   * 존재하지 않는다면 null을 반환합니다.
   * @author 현웅
   */
  async getUserByNickname(nickname: string) {
    const user = await this.User.findOne({
      nickname,
    })
      .select({ _id: 1 })
      .lean();

    if (user) return user;
    return null;
  }

  /**
   * 인자로 받은 _id 를 사용하는 유저의 비밀번호와 salt 를 반환합니다.
   * @author 현웅
   */
  async getUserSecurityById(userId: string) {
    return await this.UserSecurity.findById(userId)
      .select({
        password: 1,
        salt: 1,
      })
      .lean();
  }

  /**
   * 이메일을 인자로 받아 해당 이메일을 사용하는 유저의 _id, 비밀번호와 salt 를 반환합니다.
   * @author 현웅
   */
  async getUserSecurityByEmail(email: string) {
    const user = await this.User.findOne({
      email,
    })
      .select({ _id: 1 })
      .lean();

    if (!user) throw new UserNotFoundException();

    return await this.UserSecurity.findById(user._id).lean();
  }

  /**
   * 인자로 받은 userId 를 사용하는 유저의 최근 20개 크레딧 사용내역을 가져옵니다.
   * @author 현웅
   */
  async getCreditHisories(userId: string) {
    return await this.CreditHistory.find({ userId })
      .sort({ _id: -1 })
      .limit(20)
      .lean();
  }

  /**
   * 인자로 받은 userId 의 크레딧 사용내역 중
   * 인자로 받은 creditHistoryId 보다 최신의 크레딧 사용내역을 모두 가져옵니다.
   * @author 현웅
   */
  async getNewerCreditHisories(param: {
    userId: string;
    creditHistoryId: string;
  }) {
    return await this.CreditHistory.find({
      _id: { $gt: param.creditHistoryId },
      userId: param.userId,
    })
      .sort({ _id: -1 })
      .lean();
  }

  /**
   * 인자로 받은 userId 의 크레딧 사용내역 중
   * 인자로 받은 creditHistoryId 보다 오래된 크레딧 사용내역을 20개 가져옵니다.
   * @author 현웅
   */
  async getOlderCreditHisories(param: {
    userId: string;
    creditHistoryId: string;
  }) {
    return await this.CreditHistory.find({
      _id: { $lt: param.creditHistoryId },
      userId: param.userId,
    })
      .sort({ _id: -1 })
      .limit(20)
      .lean();
  }
}
