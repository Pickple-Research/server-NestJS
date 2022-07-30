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
  UserResearch,
  UserResearchDocument,
  UserSecurity,
  UserSecurityDocument,
  UserVote,
  UserVoteDocument,
  // Embedded
  ParticipatedResearchInfo,
  ParticipatedVoteInfo,
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
    @InjectModel(UserResearch.name)
    private readonly UserResearch: Model<UserResearchDocument>,
    @InjectModel(UserSecurity.name)
    private readonly UserSecurity: Model<UserSecurityDocument>,
    @InjectModel(UserVote.name)
    private readonly UserVote: Model<UserVoteDocument>,
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
   * 기존 비밀번호를 통해 비밀번호를 변경합니다.
   * @author 현웅
   */
  async changePassword(param: { userId: string; newPassword: string }) {
    await this.UserSecurity.findByIdAndUpdate(param.userId, {
      $set: { password: param.newPassword },
    });
    return;
  }

  /**
   * 기존 비밀번호를 잊어버린 경우)
   * 비밀번호 재설정 인증 코드를 업데이트합니다.
   * @author 현웅
   */
  async updateAuthCode(
    param: { userId: string; authCode: string; codeExpiredAt: string },
    session: ClientSession,
  ) {
    return await this.UserSecurity.findByIdAndUpdate(
      param.userId,
      {
        $set: {
          verified: false,
          authCode: param.authCode,
          codeExpiredAt: param.codeExpiredAt,
        },
      },
      { session },
    );
  }

  /**
   * 기존 비밀번호를 잊어버린 경우)
   * 비밀번호 재설정 인증 코드가 검증되었음을 설정합니다.
   * @author 현웅
   */
  async updateVerifiedFlag(userId: string) {
    return await this.UserSecurity.findByIdAndUpdate(userId, {
      $set: { verified: true },
    });
  }

  /**
   * 기존 비밀번호를 잊어버린 경우)
   * 이메일 인증 후 비밀번호를 재설정하고, 이메일 인증 완료 플래그를 false 로 설정합니다.
   * @author 현웅
   */
  async resetPassword(param: { userId: string; newPassword: string }) {
    await this.UserSecurity.findByIdAndUpdate(param.userId, {
      $set: { password: param.newPassword, verified: false },
    });
    return;
  }

  /**
   * 조회한 리서치 _id를 UserResearch 에 추가합니다.
   * @author 현웅
   */
  async viewResearch(param: { userId: string; researchId: string }) {
    await this.UserResearch.findByIdAndUpdate(
      param.userId,
      //? $addToSet: 추가하려는 원소가 이미 존재하면 push하지 않습니다.
      { $addToSet: { viewedResearchIds: param.researchId } },
    );
    return;
  }

  /**
   * 리서치를 새로 스크랩합니다.
   * @author 현웅
   */
  async scrapResearch(param: { userId: string; researchId: string }) {
    await this.UserResearch.findByIdAndUpdate(param.userId, {
      $push: {
        scrappedResearchIds: { $each: [param.researchId], $position: 0 },
      },
    });
    return;
  }

  /**
   * 스크랩한 리서치를 제거합니다.
   * @author 현웅
   */
  async unscrapResearch(param: { userId: string; researchId: string }) {
    await this.UserResearch.findByIdAndUpdate(param.userId, {
      $pull: { scrappedResearchIds: param.researchId },
    });
    return;
  }

  /**
   * 리서치에 참여합니다. UserResearch 와 User 의 credit 정보를 업데이트 합니다.
   * @return 새로 만들어진 CreditHistory 정보
   * @author 현웅
   */
  async participateResearch(
    param: {
      userId: string;
      participatedResearchInfo: ParticipatedResearchInfo;
    },
    session?: ClientSession,
  ) {
    await this.UserResearch.findByIdAndUpdate(
      param.userId,
      {
        $push: {
          participatedResearchInfos: {
            $each: [param.participatedResearchInfo],
            $position: 0,
          },
        },
      },
      { session },
    );
    return;
  }

  /**
   * 조회한 투표 _id를 UserVote 에 추가합니다.
   * @author 현웅
   */
  async viewVote(param: { userId: string; voteId: string }) {
    await this.UserVote.findByIdAndUpdate(
      param.userId,
      //? $addToSet: 추가하려는 원소가 이미 존재하면 push하지 않습니다.
      { $addToSet: { viewedVoteIds: param.voteId } },
    );
    return;
  }

  /**
   * 투표를 새로 스크랩합니다.
   * @author 현웅
   */
  async scrapVote(param: { userId: string; voteId: string }) {
    await this.UserVote.findByIdAndUpdate(param.userId, {
      $push: { scrappedVoteIds: { $each: [param.voteId], $position: 0 } },
    });
    return;
  }

  /**
   * 스크랩한 투표를 제거합니다.
   * @author 현웅
   */
  async unscrapVote(param: { userId: string; voteId: string }) {
    await this.UserVote.findByIdAndUpdate(param.userId, {
      $pull: { scrappedVoteIds: param.voteId },
    });
    return;
  }

  /**
   * @Transaction
   * 투표에 참여합니다. UserVote를 업데이트합니다.
   * @author 현웅
   */
  async participateVote(
    param: { userId: string; participatedVoteInfo: ParticipatedVoteInfo },
    session: ClientSession,
  ) {
    await this.UserVote.findByIdAndUpdate(
      param.userId,
      {
        $push: {
          participatedVoteInfos: {
            $each: [param.participatedVoteInfo],
            $position: 0,
          },
        },
      },
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
