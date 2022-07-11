import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ClientSession } from "mongoose";
import {
  CreditHistory,
  CreditHistoryDocument,
  UnauthorizedUser,
  UnauthorizedUserDocument,
  User,
  UserDocument,
  UserPrivacy,
  UserPrivacyDocument,
  UserProperty,
  UserPropertyDocument,
  UserResearch,
  UserResearchDocument,
  UserSecurity,
  UserSecurityDocument,
  UserVote,
  UserVoteDocument,
} from "src/Schema";

/**
 * 유저 데이터를 생성하는 mongo 서비스 모음입니다.
 * @author 현웅
 */
@Injectable()
export class MongoUserCreateService {
  constructor(
    @InjectModel(CreditHistory.name)
    private readonly CreditHistory: Model<CreditHistoryDocument>,
    @InjectModel(UnauthorizedUser.name)
    private readonly UnauthorizedUser: Model<UnauthorizedUserDocument>,
    @InjectModel(User.name) private readonly User: Model<UserDocument>,
    @InjectModel(UserPrivacy.name)
    private readonly UserPrivacy: Model<UserPrivacyDocument>,
    @InjectModel(UserProperty.name)
    private readonly UserProperty: Model<UserPropertyDocument>,
    @InjectModel(UserResearch.name)
    private readonly UserResearch: Model<UserResearchDocument>,
    @InjectModel(UserSecurity.name)
    private readonly UserSecurity: Model<UserSecurityDocument>,
    @InjectModel(UserVote.name)
    private readonly UserVote: Model<UserVoteDocument>,
  ) {}

  /**
   * 이메일을 이용하여 회원가입을 시도하는 미인증 유저를 생성합니다.
   * 이미 해당 이메일이 존재하는 경우, 기존 데이터를 덮어씁니다.
   * @author 현웅
   */
  async createUnauthorizedUser(
    param: { userInfo: UnauthorizedUser },
    session: ClientSession,
  ) {
    await this.UnauthorizedUser.updateOne(
      { email: param.userInfo.email },
      { ...param.userInfo },
      { upsert: true, session },
    );
    return;
  }

  /**
   * @Transaction
   * 메일 인증이 완료된 미인증 유저를 정규 유저로 전환합니다.
   * UserProperty, UserPrivacy, UserSecurity UserResearch, UserVote Document도 함께 만들고,
   * 해당 email을 사용하는 미인증 유저 데이터를 삭제합니다.
   * @return 새로운 정규 유저 정보 중 ResearchUser 및 VoteUser 에 저장할 유저 정보 Object
   * @author 현웅
   */
  async createEmailUser(
    param: {
      user: User;
      userPrivacy?: UserPrivacy;
      userProperty?: UserProperty;
      userSecurity?: UserSecurity;
    },
    session: ClientSession,
  ) {
    //* 새로운 User 데이터 생성
    const newUsers = await this.User.create([param.user], { session });

    //* 새로 생성된 User 데이터에서 _id 추출
    //* (mongoose의 create 함수는 여러 개의 데이터를 만들 수 있도록 배열 형태의 인자를 받고
    //*   배열 형태의 결과를 반환하기 때문에 [0]으로 인덱싱 해줘야 함)
    const newUserId = newUsers[0]._id;

    //* 새로운 유저 개인정보, 특성정보, 보안정보, 리서치 활동정보, 투표 활동정보 데이터를 만들되
    //* 새로운 유저 데이터의 _id를 공유하도록 설정합니다.
    await this.UserPrivacy.create([{ _id: newUserId, ...param.userPrivacy }], {
      session,
    });
    await this.UserProperty.create(
      [{ _id: newUserId, ...param.userProperty }],
      { session },
    );
    await this.UserSecurity.create(
      [{ _id: newUserId, ...param.userSecurity }],
      { session },
    );
    await this.UserResearch.create([{ _id: newUserId }], { session });
    await this.UserVote.create([{ _id: newUserId }], { session });

    //* ResearchUser와 VoteUser에 저장할 유저 정보를 추출해 반환합니다.
    const newUser = newUsers[0].toObject();
    return {
      _id: newUser._id,
      userType: newUser.userType,
      nickname: `newUser.nickname`,
      grade: newUser.grade,
    };
  }

  /**
   * @Transaction
   * 크레딧 사용내역을 새로 만들고 User 의 credit 정보에 반영합니다.
   * @return 새로 만들어진 CreditHistory 정보
   * @author 현웅
   */
  async createCreditHistory(
    param: {
      userId: string;
      creditHistory: CreditHistory;
    },
    session: ClientSession,
  ) {
    //* 잔여 크레딧 정보를 추가한 CreditHistory 를 새로 만듭니다.
    const newCreditHistories = await this.CreditHistory.create(
      [param.creditHistory],
      { session },
    );
    //* User의 credit 액수를 업데이트하고
    //* 새로 만들어진 CreditHistory 의 _id 를 추가합니다.
    await this.User.findByIdAndUpdate(
      param.userId,
      { $inc: { credit: param.creditHistory.scale } },
      { session },
    );
    return newCreditHistories[0].toObject();
  }
}
