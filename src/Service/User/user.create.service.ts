import { Injectable, Inject } from "@nestjs/common";
import { ClientSession } from "mongoose";
import {
  MongoUserFindService,
  MongoUserCreateService,
  MongoUserDeleteService,
} from "src/Mongo";
import {
  UnauthorizedUser,
  User,
  UserPrivacy,
  UserProperty,
  UserSecurity,
} from "src/Schema";

/**
 * 유저를 생성하는 서비스입니다.
 * @author 현웅
 */
@Injectable()
export class UserCreateService {
  constructor() {}

  @Inject() private readonly mongoUserFindService: MongoUserFindService;
  @Inject() private readonly mongoUserCreateService: MongoUserCreateService;
  @Inject() private readonly mongoUserDeleteService: MongoUserDeleteService;

  async createUnauthorizedUser(
    param: { userInfo: UnauthorizedUser },
    session: ClientSession,
  ) {
    //* 해당 이메일로 가입된 정규 유저가 있는지 확인합니다.
    const checkEmailDuplicated = this.mongoUserFindService.checkEmailDuplicated(
      param.userInfo.email,
    );
    //* 새로운 미인증 유저 데이터를 생성합니다.
    //* 이미 존재하는 경우, 데이터를 업데이트 합니다.
    const createUnauthorizedUser =
      this.mongoUserCreateService.createUnauthorizedUser(
        { userInfo: param.userInfo },
        session,
      );
    //* 위 두 함수를 동시에 실행합니다.
    //* 이메일 중복 검증에 실패하는 경우 미인증 유저에 관련된 작업은 모두 무효화됩니다.
    await Promise.all([checkEmailDuplicated, createUnauthorizedUser]);

    return;
  }

  /**
   * 이메일 인증이 완료된 미인증 유저 데이터를 기반으로 새로운 이메일 유저를 생성합니다.
   * @return 새로 생성된 유저 정보
   * @author 현웅
   */
  async createEmailUser(
    param: {
      user: User;
      userPrivacy: UserPrivacy;
      userProperty: UserProperty;
      userSecurity: UserSecurity;
    },
    session: ClientSession,
  ) {
    //* 해당 이메일로 가입된 정규 유저가 있는지 확인합니다.
    const checkEmailDuplicated =
      await this.mongoUserFindService.checkEmailDuplicated(param.user.email);
    //* 이메일 인증이 완료되어 있는지 확인합니다.
    const checkEmailAuthorized =
      await this.mongoUserFindService.checkEmailAuthorized({
        email: param.user.email,
      });
    //* 기존의 미인증 유저 데이터를 삭제합니다.
    const deleteUnauthorizedUser =
      await this.mongoUserDeleteService.deleteUnauthorizedUser(
        { email: param.user.email },
        session,
      );
    //* 이메일 중복 확인, 인증 완료 확인, 기존 미인증 유저 삭제를 한꺼번에 진행합니다.
    await Promise.all([
      checkEmailDuplicated,
      checkEmailAuthorized,
      deleteUnauthorizedUser,
    ]);

    //* 이 후, 새로운 유저를 생성하고 생성된 유저 정보를 반환합니다.
    return await this.mongoUserCreateService.createEmailUser(
      {
        user: param.user,
        userPrivacy: param.userPrivacy,
        userProperty: param.userProperty,
        userSecurity: param.userSecurity,
      },
      session,
    );
  }
}
