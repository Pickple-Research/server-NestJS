import { IsString } from "class-validator";

export class UserSignupBodyDto {
  @IsString()
  email?: string;

  @IsString()
  password?: string;

  @IsString()
  nickname?: string;
}

export class UserSignupDto {
  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsString()
  name: string;
}
