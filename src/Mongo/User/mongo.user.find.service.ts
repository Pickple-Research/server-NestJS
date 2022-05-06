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
import { AccountType, UserType } from "src/Object/Enum";

@Injectable()
export class MongoUserFindService {
  constructor(
    @InjectModel(UnauthorizedUser.name)
    private readonly UnauthorizedUser: Model<UnauthorizedUserDocument>,
    @InjectModel(User.name) private readonly User: Model<UserDocument>,
    @InjectModel(UserActivity.name)
    private readonly UserActivity: Model<UserActivityDocument>,
  ) {}

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
   * 유저가 리서치를 조회한 적이 있는지 확인합니다.
   * 유저 정보가 없거나, 리서치를 조회한 적이 있는 경우 true를
   * 리서치를 조회하지 않은 경우 false를 반환합니다.
   * @author 현웅
   */
  async didUserViewedResearch(userId: string, researchId: string) {
    const userActivity = await this.UserActivity.findOne({
      _id: userId,
    })
      .select({ viewedResearchIds: 1 })
      .lean();

    //* 조회한 리서치 _id 목록에 researchId가 포함되어 있는 경우
    if (!userActivity || userActivity.viewedResearchIds.includes(researchId)) {
      return true;
    }

    return false;
  }

  /**
   * 유저가 리서치를 스크랩 했는지 확인합니다.
   * 유저 정보가 없거나, 리서치를 스크랩한 경우 true를
   * 리서치를 스크랩하지 않은 경우 false를 반환합니다.
   * @author 현웅
   */
  async didUserScrappedResearch(userId: string, researchId: string) {
    const userActivity = await this.UserActivity.findOne({
      _id: userId,
    })
      .select({ scrappedResearchInfos: 1 })
      .lean();

    //* 스크랩한 리서치 목록에 researchId가 포함되어 있는 경우
    if (
      !userActivity ||
      userActivity.scrappedResearchInfos.some(
        (researchInfo) => researchInfo.researchId === researchId,
      )
    ) {
      return true;
    }

    return false;
  }

  /**
   * 유저가 리서치에 참여한 적이 있는지 확인합니다.
   * 유저 정보가 없거나, 리서치에 참여한 적이 있는 경우 true를
   * 리서치를 참여하지 않은 경우 false를 반환합니다.
   * @author 현웅
   */
  async didUserParticipatedResearch(userId: string, researchId: string) {
    const userActivity = await this.UserActivity.findOne({
      _id: userId,
    })
      .select({ participatedResearchInfos: 1 })
      .lean();

    //* 참여한 리서치 목록에 researchId가 포함되어 있는 경우
    if (
      !userActivity ||
      userActivity.participatedResearchInfos.some(
        (researchInfo) => researchInfo.researchId === researchId,
      )
    ) {
      return true;
    }

    return false;
  }
}
