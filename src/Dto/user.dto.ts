import { IsString } from "class-validator";

export class UserSignupDto {
  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsString()
  name: string;
}
