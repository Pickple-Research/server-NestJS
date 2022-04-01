import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type UnauthorizedUserDocument = UnauthorizedUser & Document;

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

  @Prop() // 인증 코드
  authorizationCode: string;
}

export const UnauthorizedUserSchema =
  SchemaFactory.createForClass(UnauthorizedUser);
