import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * 이메일 인증이 완료되지 않은 유저 정보 스키마입니다.
 * 생성된지 일주일이 지나면 CronJob을 통해 자동 삭제됩니다.
 * @author 현웅
 */
@Schema()
export class UnauthorizedUser {
  @Prop() // 이메일
  email: string;

  @Prop() // 비밀번호
  password: string;

  @Prop() // 비밀번호 해쉬 salt
  salt: string;

  @Prop() // 인증 코드
  authorizationCode: string;

  @Prop() // 회원가입 일자 (일주일 지나면 데이터 삭제: cronjob을 동적으로 생성하여 제거)
  createdAt: string;
}

export const UnauthorizedUserSchema =
  SchemaFactory.createForClass(UnauthorizedUser);

export type UnauthorizedUserDocument = UnauthorizedUser & Document;
