import { Injectable, Inject } from "@nestjs/common";
import { MongoUserFindService } from "src/Mongo";

@Injectable()
export class UserFindService {
  constructor() {}

  @Inject() private readonly mongoUserFindService: MongoUserFindService;

  /**
   * 이메일과 비밀번호를 받아 로그인합니다.
   * 성공적인 경우, UserPrivacy를 제외한 유저 정보를 반환합니다.
   * @author 현웅
   */
  async loginWithEmail(email: string, password: string) {
    const authorize = this.mongoUserFindService.authorize(email, password);
    const getUserInfo = this.mongoUserFindService.getUserInfoByEmail(email);

    const userInfo = await Promise.all([authorize, getUserInfo]).then(
      ([_, userInfo]) => {
        return userInfo;
      },
    );
    return userInfo;
  }
}
