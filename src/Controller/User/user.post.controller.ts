import { Controller, Inject, Request, Body, Post } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import {
  EmailUnauthorizedUserSignupBodyDto,
  EmailUserSignupBodyDto,
} from "src/Dto";
import { AuthService, UserCreateService } from "src/Service";
import { MongoResearchCreateService, MongoVoteCreateService } from "src/Mongo";
import { UnauthorizedUser, User } from "src/Schema";
import { Public } from "src/Security/Metadata";
import {
  tryMultiTransaction,
  getSalt,
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
    private readonly authService: AuthService,
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
      codeExpiredAt: getISOTimeAfterGivenMinutes(15),
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
   * 정규 유저 생성 이후엔 ResearchUser, VoteUser 데이터도 생성합니다.
   * @return 생성된 유저 JWT
   * @author 현웅
   */
  @Public()
  @Post("email")
  async createEmailUser(@Body() body: EmailUserSignupBodyDto) {
    const userSession = await this.userConnection.startSession();
    const researchSession = await this.researchConnection.startSession();
    const voteSession = await this.voteConnection.startSession();

    const salt = getSalt();
    const hashedPassword = await this.authService.getHashPassword(
      body.password,
      salt,
    );

    const user: User = {
      userType: UserType.USER,
      accountType: AccountType.EMAIL,
      email: body.email,
      nickname: body.nickname,
      createdAt: getCurrentISOTime(),
    };
    const userPrivacy = { lastName: body.lastName, name: body.name };
    const userProperty = { gender: body.gender, birthday: body.birthday };
    const userSecurity = { password: hashedPassword, salt };

    return await tryMultiTransaction(async () => {
      //* 새로운 유저를 생성합니다.
      const newUser = await this.userCreateService.createEmailUser(
        { user, userPrivacy, userProperty, userSecurity },
        userSession,
      );

      //* ResearchUser, VoteUser 에 사용되는 유저 정보를 생성합니다.
      const author = {
        _id: newUser._id,
        userType: newUser.userType,
        nickname: newUser.nickname,
        grade: newUser.grade,
      };

      //* 새로 만들어진 유저 정보를 바탕으로 ResearchUser 를 생성합니다.
      const createResearchUser =
        this.mongoResearchCreateService.createResearchUser(
          { user: author },
          researchSession,
        );
      //* 새로 만들어진 유저 정보를 바탕으로 VoteUser 를 생성합니다.
      const createVoteUser = this.mongoVoteCreateService.createVoteUser(
        { user: author },
        voteSession,
      );

      //* ResearchUser, VoteUser 데이터를 한꺼번에 생성합니다.
      await Promise.all([createResearchUser, createVoteUser]);
    }, [userSession, researchSession, voteSession]);
  }
}
