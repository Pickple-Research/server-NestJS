import { IsEnum, IsString } from "class-validator";
import { UserType, AccountType } from "../Object/Enum";

/**
 * 회원가입 요청시 Body에 포함되어야 하는 정보들입니다.
 * @author 현웅
 */
export class UserSignupBodyDto {
  @IsString()
  email?: string;

  @IsString()
  password?: string;

  @IsString()
  nickname?: string;
}

/**
 * 실제 회원가입시 필요한 정보들입니다.
 * UserSignupBodyDto에 더하여 유저 타입과 계정 타입을 명시합니다.
 * @author 현웅
 */
export class UserSignupDto extends UserSignupBodyDto {
  @IsEnum(UserType)
  userType: UserType;

  @IsEnum(AccountType)
  accountType: AccountType;
}
