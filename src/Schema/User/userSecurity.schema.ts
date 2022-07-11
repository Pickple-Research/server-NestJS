import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * 유저 비밀번호, 인증번호를 담는  스키마입니다.
 * @author 현웅
 */
@Schema()
export class UserSecurity {
  @Prop({ required: true }) // 비밀번호
  password: string;

  @Prop({ required: true }) // 비밀번호 해쉬 salt
  salt: string;

  @Prop() // 이메일을 통한 비밀번호 재설정 시 사용하는 6자리 인증번호
  authCode?: string;
}

export const UserSecuritySchema = SchemaFactory.createForClass(UserSecurity);

export type UserSecurityDocument = UserSecurity & Document;
