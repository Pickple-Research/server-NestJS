import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ClientSession } from "mongoose";
import {
  UnauthorizedUser,
  UnauthorizedUserDocument,
  User,
  UserDocument,
  UserPrivacy,
  UserPrivacyDocument,
  UserProperty,
  UserPropertyDocument,
  UserSecurity,
  UserSecurityDocument,
} from "src/Schema";
import { didDatePassed } from "src/Util";
import {
  WrongAuthorizationCodeException,
  AuthCodeExpiredException,
} from "src/Exception";

@Injectable()
export class MongoUserUpdateService {
  constructor(
    @InjectModel(UnauthorizedUser.name)
    private readonly UnauthorizedUser: Model<UnauthorizedUserDocument>,
    @InjectModel(User.name) private readonly User: Model<UserDocument>,
    @InjectModel(UserPrivacy.name)
    private readonly UserPrivacy: Model<UserPrivacyDocument>,
    @InjectModel(UserProperty.name)
    private readonly UserProperty: Model<UserPropertyDocument>,
    @InjectModel(UserSecurity.name)
    private readonly UserSecurity: Model<UserSecurityDocument>,
  ) {}

  /**
   * 인자로 받은 이메일을 사용하는 미인증 유저의 인증번호와
   * 인자로 받은 인증번호가 일치하는지 확인합니다.
   * 인증번호가 일치하지 않거나 인증번호가 만료되었다면 에러를 일으킵니다.
   * 인증번호가 일치하면 인증 여부를 true로 변경합니다.
   * @author 현웅
   */
  async verifyUnauthorizedUserCode(param: { email: string; code: string }) {
    const unauthorizedUser = await this.UnauthorizedUser.findOne({
      email: param.email,
    })
      .select({ authorizationCode: 1, codeExpiredAt: 1 })
      .lean();

    //* 해당 이메일을 사용하는 유저가 없거나, 인증번호가 일치하지 않는 경우
    if (
      !unauthorizedUser ||
      unauthorizedUser.authorizationCode !== param.code
    ) {
      throw new WrongAuthorizationCodeException();
    }

    //* 인증번호 유효기간이 만료된 경우
    if (didDatePassed(unauthorizedUser.codeExpiredAt)) {
      throw new AuthCodeExpiredException();
    }

    //TODO: #QUERY-EFFICIENCY 한번의 DB 검색으로 끝낼 수 있는 방법 없나?
    //* 인증번호가 일치하는 경우
    await this.UnauthorizedUser.findOneAndUpdate(
      { email: param.email },
      { $set: { authorized: true } },
    );
    return;
  }

  /**
   * User 스키마에 해당하는 값들을 업데이트하고 반환합니다.
   * @return 업데이트된 User 도큐먼트
   * @author 현웅
   */
  async updateUser(
    param:
      | { userId: string; user: Partial<User> }
      | { userEmail: string; user: Partial<User> },
  ) {
    if ("userId" in param) {
      return await this.User.findByIdAndUpdate(
        param.userId,
        {
          $set: param.user,
        },
        { returnOriginal: false },
      );
    }
    if ("userEmail" in param) {
      return await this.User.findOneAndUpdate(
        { email: param.userEmail },
        { $set: param.user },
        { returnOriginal: false },
      );
    }
  }

  /**
   * UserSecurity 스키마에 해당하는 값들을 업데이트합니다.
   * @author 현웅
   */
  async updateUserSecurity(
    param: {
      userId: string;
      userSecurity: Partial<UserSecurity>;
    },
    session?: ClientSession,
  ) {
    await this.UserSecurity.findByIdAndUpdate(
      param.userId,
      { $set: param.userSecurity },
      { session },
    );
    return;
  }

  async followPartner(
    param: { userId: string; partnerId: string },
    session?: ClientSession,
  ) {
    return "follow";
  }

  async unfollowPartner(
    param: { userId: string; partnerId: string },
    session?: ClientSession,
  ) {
    return "unfollow";
  }
}
