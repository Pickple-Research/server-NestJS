import { Injectable, Inject } from "@nestjs/common";
import { MongoUserFindService, MongoUserCreateService } from "src/Mongo";
import { UserSignupDto } from "src/Dto";
import { EmailDuplicateException } from "src/Exception";
import { UnauthorizedUser } from "src/Schema";

/**
 * 유저를 생성하는 서비스입니다.
 * @author 현웅
 */
@Injectable()
export class UserCreateService {
  constructor() {}

  @Inject() private readonly mongoUserFindService: MongoUserFindService;
  @Inject() private readonly mongoUserCreateService: MongoUserCreateService;

  /**
   * 이메일을 이용하여 회원가입하는 미인증 유저 데이터를 생성합니다.
   * @author 현웅
   */
  async createUnauthorizedUser(userInfo: UnauthorizedUser) {
    //* 이미 해당 이메일로 회원가입 시도 중인 미인증 유저가 있는 경우
    if (await this.mongoUserFindService.getUnauthorizedUser(userInfo.email)) {
      throw new EmailDuplicateException();
    }

    //* 이미 해당 이메일로 가입된 유저가 있는 경우
    if (await this.mongoUserFindService.getUserByEmail(userInfo.email)) {
      throw new EmailDuplicateException();
    }

    return await this.mongoUserCreateService.createUnauthorizedUser(userInfo);
  }

  /**
   * @Post
   * 미인증 유저를 정규유저로 전환합니다.
   * @author 현웅
   */
  async createEmailUser() {
    //TODO: 추후 이 곳에서 userSignupDto의 내용에 UserType을 추가해줘야 합니다.
    return await this.mongoUserCreateService.createEmailUser();
  }
}
