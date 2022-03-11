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

  async getUserByEmail(email: string, allowDuplicate: boolean) {
    console.log("inner function is working");
    const result = Math.random();
    return { value: result, message: "successed!" };
  }

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
