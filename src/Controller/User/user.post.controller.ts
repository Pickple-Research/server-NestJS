import { Controller, Inject, Body, Post } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import {
  EmailUnauthorizedUserSignupBodyDto,
  EmailUserSignupBodyDto,
  UserActivityBodyDto,
} from "src/Dto";
import { UserFindService, UserCreateService } from "src/Service";
import { MongoResearchCreateService, MongoVoteCreateService } from "src/Mongo";
import { UnauthorizedUser, User } from "src/Schema";
import { Public } from "src/Security/Metadata";
import {
  tryMultiTransaction,
  getSalt,
  getKeccak512Hash,
  getCurrentISOTime,
  getISOTimeAfterGivenMinutes,
} from "src/Util";
import { AccountType, UserType } from "src/Object/Enum";
import {
  MONGODB_USER_CONNECTION,
  MONGODB_RESEARCH_CONNECTION,
  MONGODB_VOTE_CONNECTION,
} from "src/Constant";

/**
 * 유저 계정을 만드는 Controller입니다.
 * @author 현웅
 */
@Controller("users")
export class UserPostController {
  constructor(
    private readonly userFindService: UserFindService,
    private readonly userCreateService: UserCreateService,

    @InjectConnection(MONGODB_USER_CONNECTION)
    private readonly userConnection: Connection,
    @InjectConnection(MONGODB_RESEARCH_CONNECTION)
    private readonly researchConnection: Connection,
    @InjectConnection(MONGODB_VOTE_CONNECTION)
    private readonly voteConnection: Connection,
  ) {}

  @Inject()
  private readonly mongoResearchCreateService: MongoResearchCreateService;
  @Inject() private readonly mongoVoteCreateService: MongoVoteCreateService;

  /**
   * 이메일을 이용하여 회원가입을 시도하는 미인증 유저 데이터를 생성합니다.
   * TODO: 생성되고 1주일 뒤 삭제되도록 동적 cronjob을 정의해야 합니다.
   * @author 현웅
   */
  @Public()
  @Post("email/unauthorized")
  async createUnauthorizedUser(
    @Body() body: EmailUnauthorizedUserSignupBodyDto,
  ) {
    const userSession = await this.userConnection.startSession();

    const userInfo: UnauthorizedUser = {
      email: body.email,
      authorized: false,
      authorizationCode: (
        "00000" + Math.floor(Math.random() * 1_000_000).toString()
      ).slice(-6),
      codeExpiredAt: getISOTimeAfterGivenMinutes(),
      createdAt: getCurrentISOTime(),
    };

    return await tryMultiTransaction(async () => {
      return await this.userCreateService.createUnauthorizedUser(
        { userInfo },
        userSession,
      );
    }, [userSession]);
  }

  /**
   * 이메일 인증이 완료된 정규 유저를 생성합니다.
   * 인자로 받은 이메일을 사용하는 미인증 유저 데이터를 삭제하고
   * User, UserCredit, UserProperty, UserPrivacy, UserResearch, UserVote 데이터를 생성합니다.
   * 또한 ResearchUser, VoteUser 데이터를 생성합니다.
   * @author 현웅
   */
  @Public()
  @Post("email")
  async createEmailUser(@Body() body: EmailUserSignupBodyDto) {
    const startUserSession = this.userConnection.startSession();
    const startResearchSession = this.researchConnection.startSession();
    const startVoteSession = this.voteConnection.startSession();

    const { userSession, researchSession, voteSession } = await Promise.all([
      startUserSession,
      startResearchSession,
      startVoteSession,
    ]).then(([userSession, researchSession, voteSession]) => {
      return {
        userSession,
        researchSession,
        voteSession,
      };
    });

    const salt = getSalt();
    const hashedPassword = getKeccak512Hash(
      body.password + salt,
      parseInt(process.env.PEPPER),
    );

    const user: User = {
      userType: UserType.USER,
      accountType: AccountType.EMAIL,
      email: body.email,
      salt,
      password: hashedPassword,
      createdAt: getCurrentISOTime(),
    };
    const userPrivacy = { lastName: body.lastName, name: body.name };

    await tryMultiTransaction(async () => {
      //* 새로운 유저를 생성합니다.
      const newUser = await this.userCreateService.createEmailUser(
        { user, userPrivacy },
        userSession,
      );

      //* 새로 만들어진 유저 정보를 바탕으로 ResearchUser 를 생성합니다.
      const createResearchUser =
        this.mongoResearchCreateService.createResearchUser(
          { user: newUser },
          researchSession,
        );
      //* 새로 만들어진 유저 정보를 바탕으로 VoteUser 를 생성합니다.
      const createVoteUser = this.mongoVoteCreateService.createVoteUser(
        { user: newUser },
        voteSession,
      );

      //* ResearchUser, VoteUser 데이터를 한꺼번에 생성합니다.
      await Promise.all([createResearchUser, createVoteUser]);
    }, [userSession, researchSession, voteSession]);

    return;
  }

  /**
   * 유저의 크레딧 사용내역과
   * 스크랩/참여/업로드한 리서치/투표 정보를 가져옵니다.
   * @author 현웅
   */
  @Post("activity")
  async getUserActivities(@Body() body: UserActivityBodyDto) {
    return await this.userFindService.getUserActivities(body);
  }
}
