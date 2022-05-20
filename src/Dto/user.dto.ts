import { IsString } from "class-validator";

/**
 * 이메일을 사용한 회원가입 요청시 Body에 포함되어야 하는 정보들입니다.
 * @param email
 * @param password
 * @author 현웅
 */
export class EmailUserSignupBodyDto {
  @IsString()
  email: string;

  @IsString()
  password: string;
}
