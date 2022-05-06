import { Injectable } from "@nestjs/common";
import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { Model, Connection } from "mongoose";
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
import { AccountType, UserType } from "src/Object/Enum";
import { tryTransaction, getCurrentISOTime } from "src/Util";
import { MONGODB_USER_CONNECTION } from "src/Constant";

/**
 * 유저 데이터를 생성하는 mongo 서비스 모음입니다.
 * @author 현웅
 */
@Injectable()
export class MongoUserCreateService {
  constructor(
    // 서비스에서 사용할 스키마
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

    // 사용하는 DB 연결 인스턴스 (session 만드는 용도)
    @InjectConnection(MONGODB_USER_CONNECTION)
    private readonly connection: Connection,
  ) {}

  /**
   * 이메일을 이용하여 회원가입을 시도하는 미인증 유저를 생성합니다.
   * @author 현웅
   */
  async createUnauthorizedUser(userInfo: UnauthorizedUser) {
    await this.UnauthorizedUser.create([userInfo]);
    return;
  }

  /**
   * @Transaction
   * 새로운 유저를 생성합니다. UserProperty, UserActivity, UserPrivacy Document도 함께 만들고,
   * 해당 email을 사용하는 미인증 유저 데이터를 삭제합니다.
   * @author 현웅
   */
  async createEmailUser(email: string) {
    const session = await this.connection.startSession();

    return await tryTransaction(session, async () => {
      //* 회원가입을 시도하던 기존의 미인증 유저 데이터를 가져오고 삭제
      const userData = await this.UnauthorizedUser.findOneAndDelete(
        {
          email,
        },
        { session },
      ).lean();

      //* 해당 유저가 존재하지 않는 경우
      //TODO: 에러 발생시켜야 합니다 (논리 구조상 없을 것이지만)
      if (!userData) return;

      //* 기존 데이터를 사용하여 새로운 User 데이터 생성
      const newUser = await this.User.create(
        [
          {
            userType: UserType.USER,
            accountType: AccountType.EMAIL,
            email: userData.email,
            password: userData.password,
            createdAt: getCurrentISOTime(),
          },
        ],
        { session },
      );

      //* 새로 생성된 User 데이터에서 _id 추출
      //* (mongoose의 create 함수는 여러 개의 데이터를 만들 수 있도록
      //*   배열 형태의 인자를 받기 때문에 [0]으로 인덱싱 해줘야 함)
      const newUserId = newUser[0]._id;

      //* 새로운 유저 활동정보, 크레딧 사용내역, 개인정보, 특성정보 데이터를 만들되
      //* 새로운 유저 데이터의 _id를 공유하도록 설정
      //TODO: 성별, 출생년도 등의 특성 정보가 추가될 수 있도록 조정
      //TODO: #QUERY-EFFICIENCY #CREATE/DELETE-MANY (해당 해쉬태그로 모두 찾아서 바꿀 것)
      await this.UserActivity.create([{ _id: newUserId }], { session });
      await this.UserCreditHistory.create([{ _id: newUserId }], { session });
      await this.UserPrivacy.create([{ _id: newUserId }], { session });
      await this.UserProperty.create([{ _id: newUserId }], { session });

      return newUser[0];
    });
  }
}
