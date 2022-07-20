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
  UserResearch,
  UserResearchDocument,
  UserSecurity,
  UserSecurityDocument,
  UserVote,
  UserVoteDocument,
} from "src/Schema";
import {
  EmailDuplicateException,
  NicknameDuplicateException,
  UserNotFoundException,
  EmailNotAuthorizedException,
  WrongPasswordException,
  AlreadyParticipatedResearchException,
  AlreadyParticipatedVoteException,
} from "src/Exception";
import { getKeccak512Hash } from "src/Util";

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
    @InjectModel(UserResearch.name)
    private readonly UserResearch: Model<UserResearchDocument>,
    @InjectModel(UserSecurity.name)
    private readonly UserSecurity: Model<UserSecurityDocument>,
    @InjectModel(UserVote.name)
    private readonly UserVote: Model<UserVoteDocument>,
  ) {}

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
    const user = await this.User.findOne({ nickname }).lean();
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
   * 주어진 이메일과 비밀번호를 사용해 로그인이 가능한지 확인합니다.
   * 해당 이메일을 사용하는 유저가 없는 경우,
   * 혹은 비밀번호가 다른 경우 오류를 일으킵니다.
   * @param email
   * @param password
   * @author 현웅
   */
  async authenticate(email: string, password: string) {
    //* 유저 데이터 탐색
    const user = await this.User.findOne({ email }).select({ _id: 1 }).lean();

    //* 유저가 존재하지 않는 경우
    if (!user) throw new UserNotFoundException();

    const userSecurity = await this.UserSecurity.findOne({ userId: user._id })
      .select({
        password: 1,
        salt: 1,
      })
      .lean();

    //* 주어진 비밀번호 해쉬
    const hashedPassword = getKeccak512Hash(
      password + userSecurity.salt,
      parseInt(process.env.PEPPER),
    );

    //* 비밀번호가 일치하지 않는 경우
    if (hashedPassword !== userSecurity.password)
      throw new WrongPasswordException();
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
    const userResearch = this.UserResearch.findById(userId).lean();
    const userVote = this.UserVote.findById(userId).lean();

    return await Promise.all([
      user,
      userNotice,
      userProperty,
      userResearch,
      userVote,
    ]).then(
      //* [user, userNotice, ...] 형태였던 반환값을 {user, userNotice, ...} 형태로 바꿔줍니다.
      ([user, userNotice, userProperty, userResearch, userVote]) => {
        return {
          user,
          userNotice,
          userProperty,
          userResearch,
          userVote,
        };
      },
    );
  }

  /**
   * 인자로 받은 _id를 사용하는 유저를 찾고 반환합니다.
   * 존재하지 않는다면 null을 반환합니다.
   * @author 현웅
   */
  async getUserById(_id: string) {
    const user = await this.User.findOne({
      _id,
    })
      .select({ _id: 1 })
      .lean();

    if (user) return user;
    return null;
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
   * 유저 잔여 크레딧을 반환합니다.
   * @author 현웅
   */
  async getUserCredit(userId: string) {
    const user = await this.User.findById(userId).select({ credit: 1 }).lean();
    return user.credit;
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

  /**
   * 유저가 리서치에 참여한 적이 있는지 확인합니다.
   * 유저 정보가 존재하지 않거나 리서치에 참여한 적이 있는 경우 에러를 일으킵니다.
   * @param userId 유저 _id
   * @param researchId 리서치 _id
   * @author 현웅
   */
  async didUserParticipatedResearch(param: {
    userId: string;
    researchId: string;
  }) {
    const userResearch = await this.UserResearch.findOne({
      _id: param.userId,
    })
      .select({ participatedResearchInfos: 1 })
      .lean();

    //* 유저 정보가 존재하지 않는 경우
    if (!userResearch) {
      throw new UserNotFoundException();
    }

    //* 참여한 리서치 목록에 researchId가 포함되어 있는 경우
    if (
      userResearch.participatedResearchInfos.some((researchInfo) => {
        return researchInfo.researchId === param.researchId;
      })
    ) {
      throw new AlreadyParticipatedResearchException();
    }
    return;
  }

  /**
   * 유저가 투표에 참여한 적이 있는지 확인합니다.
   * 참여한 적이 있는 경우, 에러를 발생시킵니다.
   * @author 현웅
   */
  async didUserParticipatedVote(param: { userId: string; voteId: string }) {
    const userVote = await this.UserVote.findOne({
      _id: param.userId,
    })
      .select({ participatedVoteInfos: 1 })
      .lean();

    //* 유저 정보가 존재하지 않는 경우
    if (!userVote) throw new UserNotFoundException();

    //* 참여한 투표 정보 목록에 voteId를 포함한 데이터가 있는 경우
    if (
      userVote.participatedVoteInfos.some((voteInfo) => {
        return voteInfo.voteId === param.voteId;
      })
    ) {
      throw new AlreadyParticipatedVoteException();
    }

    return;
  }
}
