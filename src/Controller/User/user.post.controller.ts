import { Controller, Inject, Body, Post } from "@nestjs/common";
import { EmailUserSignupBodyDto, AuthCodeVerificationBodyDto } from "src/Dto";
import { MongoUserFindService, MongoUserCreateService } from "src/Mongo";
import {
  getSalt,
  getKeccak512Hash,
  getCurrentISOTime,
  getISOTimeAfterGivenMinutes,
} from "src/Util";
import {
  EmailDuplicateException,
  WrongAuthorizationCodeException,
} from "src/Exception";

/**
 * 테스트 유저 계정을 만드는 Controller입니다. 일반 유저 회원가입은 auth module을 참고하세요.
 * @author 현웅
 */
@Controller("users")
export class UserPostController {
  constructor() {}

  @Inject() private readonly mongoUserFindService: MongoUserFindService;
  @Inject() private readonly mongoUserCreateService: MongoUserCreateService;

  /**
   * 이메일을 이용하여 회원가입하는 미인증 유저 데이터를 생성합니다.
   * TODO: 생성되고 1주일 뒤 삭제되도록 동적 cronjob을 정의해야 합니다.
   * @author 현웅
   */
  @Post("email")
  async createUnauthorizedUser(
    @Body() emailUserSignupDto: EmailUserSignupBodyDto,
  ) {
    //* 해당 이메일로 회원가입 시도 중인 미인증 유저가 있는지 확인
    const checkUnauthorized =
      await this.mongoUserFindService.getUnauthorizedUser(
        emailUserSignupDto.email,
      );

    //* 해당 이메일로 가입된 유저가 있는지 확인
    const checkAuthorized = await this.mongoUserFindService.getUserByEmail(
      emailUserSignupDto.email,
    );

    //* 위 두 개 함수를 동시에 실행 후 결과값 반환
    const checkedResults = await Promise.all([
      checkUnauthorized,
      checkAuthorized,
    ]);

    //TODO: 첫번째 상황의 경우엔 에러 대신 인증 코드를 재설정해야 합니다.
    //* 둘 중 하나라도 존재하면 에러 발생
    if (checkedResults[0] || checkedResults[1])
      throw new EmailDuplicateException();

    //* 미인증 유저 데이터에 생성 필요한 값
    const salt = getSalt();
    const hashedPassword = getKeccak512Hash(
      emailUserSignupDto.password + salt,
      parseInt(process.env.PEPPER),
    );

    return await this.mongoUserCreateService.createUnauthorizedUser({
      ...emailUserSignupDto,
      //* password값을 plainText에서 hash 처리한 값으로 교체
      password: hashedPassword,
      //* salt 값 추가
      salt,
      //* 6자리 인증 번호 추가
      authorizationCode: (
        "00000" + Math.floor(Math.random() * 1_000_000).toString()
      ).slice(-6),
      codeExpiredAt: getISOTimeAfterGivenMinutes(),
      //* 생성시간 추가
      createdAt: getCurrentISOTime(),
    });
  }

  /**
   * 테스트 유저를 생성합니다.
   * @author 현웅
   */
  @Post("tester")
  async createTestUser() {}
}
