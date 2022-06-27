import { Controller, Inject, Body, Post } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import {
  EmailUnauthorizedUserSignupBodyDto,
  EmailUserSignupBodyDto,
} from "src/Dto";
import {
  MongoUserFindService,
  MongoUserCreateService,
  MongoResearchCreateService,
  MongoVoteCreateService,
} from "src/Mongo";
import { Public } from "src/Security/Metadata";
import {
  tryMultiTransaction,
  getCurrentISOTime,
  getISOTimeAfterGivenMinutes,
} from "src/Util";
import {
  MONGODB_USER_CONNECTION,
  MONGODB_RESEARCH_CONNECTION,
  MONGODB_VOTE_CONNECTION,
} from "src/Constant";
import { EmailDuplicateException } from "src/Exception";

/**
 * 유저 계정을 만드는 Controller입니다.
 * @author 현웅
 */
@Controller("users")
export class UserPostController {
  constructor(
    @InjectConnection(MONGODB_USER_CONNECTION)
    private readonly userConnection: Connection,
    @InjectConnection(MONGODB_RESEARCH_CONNECTION)
    private readonly researchConnection: Connection,
    @InjectConnection(MONGODB_VOTE_CONNECTION)
    private readonly voteConnection: Connection,
  ) {}

  @Inject() private readonly mongoUserFindService: MongoUserFindService;
  @Inject() private readonly mongoUserCreateService: MongoUserCreateService;
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

    return await tryMultiTransaction(async () => {
      const checkEmailUserDuplicate = async () => {
        const user = await this.mongoUserFindService.getUserByEmail(body.email);
        if (user) throw new EmailDuplicateException();
        return;
      };

      //* 해당 이메일로 가입된 정규 유저가 있는지 확인하고
      //* 이미 존재한다면, 에러를 발생시킵니다.
      const checkEmailDuplicate = await checkEmailUserDuplicate();

      //* 새로운 미인증 유저 데이터를 생성합니다.
      //* 이미 존재하는 경우, 데이터를 업데이트 합니다.
      const createUnauthorizedUser =
        await this.mongoUserCreateService.createUnauthorizedUser(
          {
            email: body.email,
            authorized: false,
            authorizationCode: (
              "00000" + Math.floor(Math.random() * 1_000_000).toString()
            ).slice(-6),
            codeExpiredAt: getISOTimeAfterGivenMinutes(),
            createdAt: getCurrentISOTime(),
          },
          userSession,
        );

      //* 위 두 함수를 동시에 실행합니다.
      //* 이메일 중복 검증에 실패하는 경우 미인증 유저에 관련된 작업은 모두 무효화됩니다.
      await Promise.all([checkEmailDuplicate, createUnauthorizedUser]);
      return;
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
    const userSession = await this.userConnection.startSession();
    const researchSession = await this.researchConnection.startSession();
    const voteSession = await this.voteConnection.startSession();

    await tryMultiTransaction(async () => {
      const checkEmailUserDuplicate = async () => {
        const user = await this.mongoUserFindService.getUserByEmail(body.email);
        if (user) throw new EmailDuplicateException();
        return;
      };

      //* 해당 이메일로 가입된 정규 유저가 있는지 확인합니다.
      const checkEmailDuplicate = await checkEmailUserDuplicate();

      //* 이메일 인증이 완료되어 있는지 확인합니다
      const checkEmailAuthorized =
        await this.mongoUserFindService.checkEmailAuthorized({
          email: body.email,
        });

      //* 새로운 유저를 생성합니다.
      const createNewUser = await this.mongoUserCreateService.createEmailUser(
        {
          user: { email: body.email, password: body.password },
          userPrivacy: { lastName: body.lastName, name: body.name },
        },
        userSession,
      );

      //* 이메일 인증 여부, 이메일 중복 여부를 검증과 새로운 유저 데이터 생성을 한꺼번에 실행하고
      //* 새로 생성된 유저 데이터를 반환합니다.
      const newUser = await Promise.all([
        checkEmailDuplicate,
        checkEmailAuthorized,
        createNewUser,
      ]).then(([_, __, newUser]) => {
        return newUser;
      });

      //* 새로 만들어진 유저 정보를 바탕으로 ResearchUser 를 생성합니다.
      const createResearchUser =
        await this.mongoResearchCreateService.createResearchUser(
          { user: newUser },
          researchSession,
        );
      //* 새로 만들어진 유저 정보를 바탕으로 VoteUser 를 생성합니다.
      const createVoteUser = await this.mongoVoteCreateService.createVoteUser(
        { user: newUser },
        voteSession,
      );
      //* 새로 만들어진 유저 데이터를 바탕으로
      //* ResearchUser, VoteUser 데이터를 한꺼번에 생성합니다.
      await Promise.all([createResearchUser, createVoteUser]);
    }, [userSession, researchSession, voteSession]);

    return;
  }

  /**
   * 테스트 유저를 생성합니다.
   * @author 현웅
   */
  @Post("tester")
  async createTestUser() {}
}
