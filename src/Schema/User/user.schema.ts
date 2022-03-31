import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { UserType, AccountType } from "../../Object/Enum";

export type UserDocument = User & Document;

/**
 * 유저 계정 정보 스키마입니다.
 * @author 현웅
 */
@Schema()
export class User {
  @Prop() //! 유저 개인 정보 document의 암호화된 _id
  userPrivacyId: string;

  @Prop({ enum: UserType, required: true }) // 유저 타입: 유저, 고객, 파트너, 테스터, 관리자
  userType: UserType;

  @Prop({ enum: AccountType, required: true }) // 계정 회원가입 타입: 이메일, 카카오, 구글, 네이버
  accountType: AccountType;

  @Prop({ index: { unique: true, sparse: true }, trim: true }) // 이메일
  email: string;

  @Prop() // 비밀번호
  password: string;

  @Prop({ index: { unique: true, sparse: true }, trim: true }) // 닉네임
  nickname: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// UserSchema.post(["save"], (error: MongoError, doc, next) => {
//   console.log(error instanceof MongooseError);
//   // console.error("schema middleware catched error");
//   // console.error(`${error.name}: ${error.message}`);
//   throw new HttpException("mongo middleware exception", 403);
// });
