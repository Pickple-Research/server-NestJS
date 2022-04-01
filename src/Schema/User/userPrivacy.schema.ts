import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type UserPrivacyDocument = UserPrivacy & Document;

/**
 * 유저 개인 정보 스키마입니다.
 * @author 현웅
 */
@Schema()
export class UserPrivacy {
  @Prop() //! 유저 계정 정보 document의 암호화된 _id
  userId: string;

  @Prop() // 실명
  name: string;

  @Prop() // 주소
  address: string;
}

export const UserPrivacySchema = SchemaFactory.createForClass(UserPrivacy);
