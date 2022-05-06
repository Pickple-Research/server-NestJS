import { IsEnum, IsString } from "class-validator";
import { UserType, AccountType } from "../Object/Enum";

/**
 * 이메일을 사용한 회원가입 요청시 Body에 포함되어야 하는 정보들입니다.
 * @author 현웅
 */
export class EmailUserSignupDto {
  @IsString()
  email: string;

  @IsString()
  password: string;
}

/**
 * 이메일 미인증 유저 인증 요청시 Body에 포함되어야 하는 정보들입니다.
 * @author 현웅
 */
export class EmailUserAuthorizationBodyDto {
  @IsString()
  email: string;

  @IsString()
  code: string;
}
