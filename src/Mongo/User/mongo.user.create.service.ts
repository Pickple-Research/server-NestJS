import { Injectable } from "@nestjs/common";
import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { Model, Connection, ClientSession } from "mongoose";
import {
  CreditHistory,
  CreditHistoryDocument,
  UnauthorizedUser,
  UnauthorizedUserDocument,
  User,
  UserDocument,
  UserCredit,
  UserCreditDocument,
  UserPrivacy,
  UserPrivacyDocument,
  UserProperty,
  UserPropertyDocument,
  UserResearch,
  UserResearchDocument,
  UserVote,
  UserVoteDocument,
} from "src/Schema";
import { AccountType, UserType } from "src/Object/Enum";
import { getSalt, getKeccak512Hash, getCurrentISOTime } from "src/Util";
import { MONGODB_USER_CONNECTION } from "src/Constant";

/**
 * 유저 데이터를 생성하는 mongo 서비스 모음입니다.
 * @author 현웅
 */
@Injectable()
export class MongoUserCreateService {
  constructor(
    @InjectModel(CreditHistory.name)
    private readonly UserCreditHistory: Model<CreditHistoryDocument>,
    @InjectModel(UnauthorizedUser.name)
    private readonly UnauthorizedUser: Model<UnauthorizedUserDocument>,
    @InjectModel(User.name) private readonly User: Model<UserDocument>,
    @InjectModel(UserCredit.name)
    private readonly UserCredit: Model<UserCreditDocument>,
    @InjectModel(UserPrivacy.name)
    private readonly UserPrivacy: Model<UserPrivacyDocument>,
    @InjectModel(UserProperty.name)
    private readonly UserProperty: Model<UserPropertyDocument>,
    @InjectModel(UserResearch.name)
    private readonly UserResearch: Model<UserResearchDocument>,
    @InjectModel(UserVote.name)
    private readonly UserVote: Model<UserVoteDocument>,

    // 사용하는 DB 연결 인스턴스 (session 만드는 용도)
    @InjectConnection(MONGODB_USER_CONNECTION)
    private readonly connection: Connection,
  ) {}

  /**
   * @Transaction
   * 유저를 생성합니다.
   * @author 현웅
   */
  async createUser() {
    return "create User";
  }

  /**
   * 이메일을 이용하여 회원가입을 시도하는 미인증 유저를 생성합니다.
   * 이미 해당 이메일이 존재하는 경우, 기존 데이터를 덮어씁니다.
   * @author 현웅
   */
  async createUnauthorizedUser(
    userInfo: UnauthorizedUser,
    session: ClientSession,
  ) {
    await this.UnauthorizedUser.updateOne(
      { email: userInfo.email },
      { ...userInfo },
      { upsert: true, session },
    );
    return;
  }

  /**
   * @Transaction
   * 메일 인증이 완료된 미인증 유저를 정규 유저로 전환합니다.
   * UserCredit, UserProperty, UserPrivacy, UserResearch, UserVote Document도 함께 만들고,
   * 해당 email을 사용하는 미인증 유저 데이터를 삭제합니다.
   * @return 새로운 정규 유저 정보 중 ResearchUser 및 VoteUser 에 저장할 유저 정보 Object
   * @author 현웅
   */
  async createEmailUser(
    param: {
      user: { email: string; password: string };
      userPrivacy: UserPrivacy;
    },
    session: ClientSession,
  ) {
    //* 회원가입을 시도하던 기존의 미인증 유저 데이터를 삭제합니다
    await this.UnauthorizedUser.findOneAndDelete(
      { email: param.user.email },
      { session },
    );

    //* 비밀번호는 해쉬시킨 후 저장합니다.
    const salt = getSalt();
    const hashedPassword = getKeccak512Hash(
      param.user.password + salt,
      parseInt(process.env.PEPPER),
    );

    //* 기존 데이터를 사용하여 새로운 User 데이터 생성
    const newUsers = await this.User.create(
      [
        {
          userType: UserType.USER,
          accountType: AccountType.EMAIL,
          email: param.user.email,
          password: hashedPassword,
          salt,
          createdAt: getCurrentISOTime(),
        },
      ],
      { session },
    );

    //* 새로 생성된 User 데이터에서 _id 추출
    //* (mongoose의 create 함수는 여러 개의 데이터를 만들 수 있도록 배열 형태의 인자를 받고
    //*   배열 형태의 결과를 반환하기 때문에 [0]으로 인덱싱 해줘야 함)
    const newUserId = newUsers[0]._id;

    //* 새로운 유저 크레딧 사용내역, 개인정보, 특성정보, 리서치 활동정보, 투표 활동정보 데이터를 만들되
    //* 새로운 유저 데이터의 _id를 공유하도록 설정합니다.
    await this.UserCredit.create([{ _id: newUserId }], { session });
    //* 유저 실명을 UserPrivacy에 저장
    await this.UserPrivacy.create(
      [
        {
          _id: newUserId,
          ...param.userPrivacy,
        },
      ],
      { session },
    );
    await this.UserProperty.create([{ _id: newUserId }], { session });
    await this.UserResearch.create([{ _id: newUserId }], { session });
    await this.UserVote.create([{ _id: newUserId }], { session });

    //* ResearchUser와 VoteUser에 저장할, 민감하지 않은 유저 정보를 추출해 반환합니다.
    const newUser = newUsers[0].toObject();
    return {
      _id: newUser._id,
      userType: newUser.userType,
      nickname: `newUser.nickname`,
      grade: newUser.grade,
    };
  }
}
