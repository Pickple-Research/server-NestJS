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
} from "src/Schema";
import {
  AlreadyParticipatedResearchException,
  UserNotFoundException,
} from "src/Exception";

@Injectable()
export class MongoUserFindService {
  constructor(
    @InjectModel(UnauthorizedUser.name)
    private readonly UnauthorizedUser: Model<UnauthorizedUserDocument>,
    @InjectModel(User.name) private readonly User: Model<UserDocument>,
    @InjectModel(UserActivity.name)
    private readonly UserActivity: Model<UserActivityDocument>,
  ) {}

  async testMongoUserRouter() {
    return "test MongoUserFindRouter";
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
   * 인자로 받은 이메일을 사용하여 회원가입을 시도 중인 유저가 있는지 확인합니다.
   * @author 현웅
   */
  async getUnauthorizedUser(email: string) {
    const user = await this.UnauthorizedUser.findOne({ email })
      .select({ email: 1 })
      .lean();

    if (user) return true;
    return false;
  }

  /**
   * 인자로 받은 이메일을 사용하는 미인증 유저의 인증번호와
   * 인자로 받은 인증번호가 일치하는지 확인합니다.
   * @author 현웅
   */
  async checkUnauthorizedUserCode(email: string, code: string) {
    const unauthorizedUser = await this.UnauthorizedUser.findOne({ email })
      .select({ authorizationCode: 1 })
      .lean();
    return unauthorizedUser.authorizationCode === code;
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
    });

    //* 유저 정보가 존재하지 않는 경우
    if (!userActivity) {
      if (handleAsException === true) throw new UserNotFoundException();
      return true;
    }

    //* 참여한 리서치 목록에 researchId가 포함되어 있는 경우
    if (userActivity.participatedResearchIds.includes(researchId)) {
      if (handleAsException === true)
        throw new AlreadyParticipatedResearchException();
      return true;
    }

    return false;
  }
}
