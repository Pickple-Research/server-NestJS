import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ClientSession } from "mongoose";
import {
  CreditHistory,
  // CreditHistoryDocument,
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
  UserVote,
  UserVoteDocument,
  // Embedded
  ParticipatedResearchInfo,
  ParticipatedVoteInfo,
} from "src/Schema";
import { WrongAuthorizationCodeException } from "src/Exception";

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
    @InjectModel(UserVote.name)
    private readonly UserVote: Model<UserVoteDocument>,
  ) {}

  /**
   * 인자로 받은 이메일을 사용하는 미인증 유저의 인증번호와
   * 인자로 받은 인증번호가 일치하는지 확인합니다.
   * 인증번호가 일치하면 인증 여부를 true로 변경하고, 그렇지 않다면 에러를 일으킵니다.
   * @author 현웅
   */
  async checkUnauthorizedUserCode(param: { email: string; code: string }) {
    const unauthorizedUser = await this.UnauthorizedUser.findOne({
      email: param.email,
    })
      .select({ authorizationCode: 1 })
      .lean();

    //* 해당 이메일을 사용하는 유저가 없거나, 인증번호가 일치하지 않는 경우
    if (
      !unauthorizedUser ||
      unauthorizedUser.authorizationCode !== param.code
    ) {
      throw new WrongAuthorizationCodeException();
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
   * 조회한 리서치 _id를 UserResearch 에 추가합니다.
   * @author 현웅
   */
  async viewResearch(userId: string, researchId: string) {
    await this.UserResearch.findOneAndUpdate(
      { _id: userId },
      //? $addToSet: 추가하려는 원소가 이미 존재하면 push하지 않습니다.
      { $addToSet: { viewedResearchIds: researchId } },
    );
    return;
  }

  /**
   * 리서치를 새로 스크랩합니다.
   * @author 현웅
   */
  async scrapResearch(userId: string, researchId: string) {
    await this.UserResearch.findByIdAndUpdate(userId, {
      $push: { scrappedResearchIds: { $each: [researchId], $position: 0 } },
    });
    return;
  }

  /**
   * 스크랩한 리서치를 제거합니다.
   * @author 현웅
   */
  async unscrapResearch(userId: string, researchId: string) {
    await this.UserResearch.findByIdAndUpdate(userId, {
      $pull: { scrappedResearchIds: researchId },
    });
    return;
  }

  /**
   * 리서치에 참여합니다. UserResearch 와 UserCredit 정보를 업데이트 합니다.
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
   * @Transaction
   * UserResearch 의 uploadedResearchIds에 리서치 _id를 추가합니다.
   * @author 현웅
   */
  async uploadResearch(
    param: { userId: string; researchId: string },
    session: ClientSession,
  ) {
    await this.UserResearch.findByIdAndUpdate(
      param.userId,
      {
        $push: {
          uploadedResearchIds: { $each: [param.researchId], $position: 0 },
        },
      },
      { session },
    );

    return;
  }

  /**
   * @Transaction
   * 본인이 업로드한 리서치를 삭제합니다.
   * 유저 리서치 활동 정보에서 uploadedResearchIds를 찾고, 인자로 받은 researchId를 제거합니다.
   * @author 현웅
   */
  async deleteUploadedResearch(
    param: { userId: string; researchId: string },
    session: ClientSession,
  ) {
    await this.UserResearch.findByIdAndUpdate(
      param.userId,
      { $pull: { uploadedResearchIds: param.researchId } },
      { session },
    );
    return;
  }

  /**
   * 조회한 투표 _id를 UserVote 에 추가합니다.
   * @author 현웅
   */
  async viewVote(userId: string, voteId: string) {
    await this.UserVote.findOneAndUpdate(
      { _id: userId },
      //? $addToSet: 추가하려는 원소가 이미 존재하면 push하지 않습니다.
      { $addToSet: { viewedVoteIds: voteId } },
    );
    return;
  }

  /**
   * 투표를 새로 스크랩합니다.
   * @author 현웅
   */
  async scrapVote(userId: string, voteId: string) {
    await this.UserVote.findByIdAndUpdate(userId, {
      $push: { scrappedVoteIds: { $each: [voteId], $position: 0 } },
    });
    return;
  }

  /**
   * 스크랩한 투표를 제거합니다.
   * @author 현웅
   */
  async unscrapVote(userId: string, voteId: string) {
    await this.UserVote.findByIdAndUpdate(userId, {
      $pull: { scrappedVoteIds: voteId },
    });
    return;
  }

  /**
   * @Transaction
   * 투표에 참여합니다. UserVote를 업데이트합니다.
   * @author 현웅
   */
  async participateVote(
    userId: string,
    participatedVoteInfo: ParticipatedVoteInfo,
    session: ClientSession,
  ) {
    await this.UserVote.findByIdAndUpdate(
      userId,
      {
        $push: {
          participatedVoteInfos: {
            $each: [participatedVoteInfo],
            $position: 0,
          },
        },
      },
      { session },
    );
    return;
  }

  /**
   * @Transaction
   * 투표를 업로드합니다.
   * UserVote 의 uploadedVoteIds 맨 앞에 업로드 된 투표 _id를 추가합니다.
   * @author 현웅
   */
  async uploadVote(
    param: { userId: string; voteId: string },
    session: ClientSession,
  ) {
    await this.UserVote.findByIdAndUpdate(
      param.userId,
      {
        $push: { uploadedVoteIds: { $each: [param.voteId], $position: 0 } },
      },
      { session },
    );
    return;
  }

  /**
   * @Transaction
   * 본인이 업로드한 투표를 삭제합니다.
   * 유저 투표 활동 정보에서 uploadedVoteIds를 찾고, 인자로 받은 voteId를 제거합니다.
   * @author 현웅
   */
  async deleteUploadedVote(
    param: { userId: string; voteId: string },
    session: ClientSession,
  ) {
    await this.UserVote.findByIdAndUpdate(
      param.userId,
      { $pull: { uploadedVoteIds: param.voteId } },
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
