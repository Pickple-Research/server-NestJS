import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  User,
  UserDocument,
  UserNotification,
  UserNotificationDocument,
  UserDetailedInfo,
  UserDetailedInfoDocument,
} from "../../Schema";
import { UserSignupDto } from "../../Dto";
import { DuplicateUserIdException, UserNotFoundError } from "src/Response";
import { getCurrentTime } from "../../Util";
// libraries
import bcrypt from "bcrypt";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly User: Model<UserDocument>,
    @InjectModel(UserNotification.name)
    private readonly UserNotification: Model<UserNotificationDocument>,
    @InjectModel(UserDetailedInfo.name)
    private readonly UserDetailedInfo: Model<UserDetailedInfoDocument>,
  ) {}

  // Get Requests
  async testUserRouter() {
    try {
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
    } catch (error) {
      return error;
    }
  }

  // Post Requests
  // 회원가입
  async signup(userSignupDto: UserSignupDto) {
    try {
      // 이메일 중복 확인
      if (await this.User.findOne({ userID: userSignupDto.userID }).exec()) {
        return new DuplicateUserIdException();
      }

      // 새로운 User 데이터 추가
      const newUser = new this.User();
      // newUser.userID = userSignupDto.userID;
      // TODO : user password 및 JWT 추가
      // newUser.userPassword = bcrypt.hashSync(userSignupDto.userPassword, 10);
      // newUser.name = userSignupDto.name;
      // newUser.email = userSignupDto.email;
      // newUser.gender = userSignupDto.gender;
      // newUser.yearBirth = userSignupDto.yearBirth;
      // newUser.email_confirmed = false;
      // newUser.password_change = false;
      // newUser.notifications = [];
      // newUser.notification_allow = true;
      // newUser.createdAt = getCurrentTime();
      newUser.save();
      return;
      // return new SignupSuccess();
    } catch (error) {
      return;
      // return new ServerErrorException(error);
    }
  }

  // 로그인
  async login() {
    return;
  }
}
