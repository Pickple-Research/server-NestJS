import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  User,
  UserDocument,
  UserNotification,
  UserNotificationDocument,
  UserDetailedInfo,
  UserDetailedInfoDocument,
} from "../Schema";

@Injectable()
export class MongoUserService {
  constructor(
    @InjectModel(User.name) private readonly User: Model<UserDocument>,
    @InjectModel(UserNotification.name)
    private readonly UserNotification: Model<UserNotificationDocument>,
    @InjectModel(UserDetailedInfo.name)
    private readonly UserDetailedInfo: Model<UserDetailedInfoDocument>,
  ) {}

  /**
   * @param email 이메일
   * @returns 인자로 받은 이메일을 사용하는 유저를 찾고 반환합니다.
   * 존재하지 않는다면 null을 반환합니다.
   * @author 현웅
   */
  async getUserByEmail(email: string) {
    const user = await this.User.findOne({
      email,
    }).lean();
    if (user) return user;
    return null;
  }

  /**
   * 소셜로그인 유저를 찾고 반환합니다.
   */
  async getUserById() {}

  /**
   * TODO: 트랜젝션 처리해야 합니다 (생성 도중 에러가 생기면 dirty data가 남기 때문)
   * 새로운 User Data를 만듭니다. UserProperty, UserActivity, UserPrivacy Data도 함께 만듭니다.
   * @author 현웅
   */
  async createNewUser() {
    const newUser = new this.User();
    const newUserNotification = new this.UserNotification();
    const newUserDetailedInfo = new this.UserDetailedInfo();
    newUser.email = "dennis2311@yonsei.ac.kr";
    newUser.level = 2;
    newUser.nickname = "undefined";
    newUser.userNotificationId = newUserNotification._id;
    newUser.userDetailedInfoId = newUserDetailedInfo._id;
    newUserNotification.userId = newUser._id;
    newUserDetailedInfo.userId = newUser._id;
    await newUser.save();
    await newUserNotification.save();
    await newUserDetailedInfo.save();
  }
}
