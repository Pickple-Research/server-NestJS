import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
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
import {
  EmailNotAuthorizedException,
  UserNotFoundException,
  WrongPasswordException,
  AlreadyParticipatedResearchException,
  AlreadyParticipatedVoteException,
} from "src/Exception";
import { getKeccak512Hash } from "src/Util";

@Injectable()
export class MongoUserFindService {
  constructor(
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
  ) {}

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
   * 주어진 이메일과 비밀번호를 사용해 로그인합니다.
   * 해당 이메일을 사용하는 유저가 없는 경우,
   * 혹은 비밀번호가 다른 경우 오류를 일으킵니다.
   * @param email
   * @param password
   */
  async login(email: string, password: string) {
    //* 유저 데이터 탐색
    const user = await this.User.findOne({ email })
      .select({ _id: 1, email: 1, salt: 1, password: 1 })
      .lean();

    //* 유저가 존재하지 않는 경우
    if (!user) throw new UserNotFoundException();

    //* 주어진 비밀번호 해쉬
    const givenPassword = getKeccak512Hash(
      password + user.salt,
      parseInt(process.env.PEPPER),
    );

    //* 비밀번호가 일치하지 않는 경우
    if (givenPassword !== user.password) throw new WrongPasswordException();

    return await this.getUserInfoById(user._id);
  }

  /**
   * TODO: UserPrivacy는 제외하고 반환
   * 주이진 userId 를 사용하는 유저 데이터를 반환합니다.
   * @author 현웅
   */
  async getUserInfoById(userId: string) {
    const user = await this.User.findById(userId)
      .select({
        email: 1,
        nickname: 1,
        grade: 1,
        createdAt: 1,
      })
      .lean();

    const userActivity = await this.UserActivity.findById(userId).lean();
    const userCreditHistory = await this.UserCreditHistory.findById(
      userId,
    ).lean();
    const userPrivacy = await this.UserPrivacy.findById(userId).lean();
    const userProperty = await this.UserProperty.findById(userId).lean();

    return await Promise.all([
      user,
      userActivity,
      userCreditHistory,
      userPrivacy,
      userProperty,
    ]).then(
      //* [user, userActivity, ...] 형태였던 반환값을 {user, userActivity, ...} 형태로 바꿔줍니다.
      ([user, userActivity, userCreditHistory, userPrivacy, userProperty]) => {
        return {
          user,
          userActivity,
          userCreditHistory,
          userPrivacy,
          userProperty,
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
   * 유저가 리서치에 참여한 적이 있는지 확인합니다.
   * 유저 정보가 존재하지 않거나 리서치에 참여한 적이 있는 경우 true를
   * 리서치를 참여하지 않은 경우 false를 반환합니다.
   * handleAsException 값을 true로 지정하는 경우, 결과가 Exception으로 처리됩니다.
   * @param userId 유저 _id
   * @param researchId 리서치 _id
   * @param handleAsException 결과를 예외로 처리할지 여부
   * @author 현웅
   */
  async didUserParticipatedResearch(
    userId: string,
    researchId: string,
    handleAsException: boolean = false,
  ) {
    const userActivity = await this.UserActivity.findOne({
      _id: userId,
    })
      .select({ participatedResearchInfos: 1 })
      .lean();

    //* 유저 정보가 존재하지 않는 경우
    if (!userActivity) {
      if (handleAsException) throw new UserNotFoundException();
      return true;
    }

    //* 참여한 리서치 목록에 researchId가 포함되어 있는 경우
    if (
      userActivity.participatedResearchInfos.some((researchInfo) => {
        return researchInfo.researchId === researchId;
      })
    ) {
      if (handleAsException) throw new AlreadyParticipatedResearchException();
      return true;
    }

    return false;
  }

  /**
   * 유저가 투표에 참여한 적이 있는지 확인합니다.
   * @author 현웅
   */
  async didUserParticipatedVote(
    userId: string,
    voteId: string,
    handleAsException: boolean = false,
  ) {
    const userActivity = await this.UserActivity.findOne({
      _id: userId,
    })
      .select({ participatedVoteInfos: 1 })
      .lean();

    //* 유저 정보가 존재하지 않는 경우
    if (!userActivity) {
      if (handleAsException) throw new UserNotFoundException();
      return true;
    }

    //* 참여한 투표 정보 목록에 voteId를 포함한 데이터가 있는 경우
    if (
      userActivity.participatedVoteInfos.some((voteInfo) => {
        return voteInfo.voteId === voteId;
      })
    ) {
      if (handleAsException) throw new AlreadyParticipatedVoteException();
      return true;
    }

    return false;
  }
}
