import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { General } from "..";
import { Notification } from "..";
import { Post } from "..";

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ unique: true, trim: true }) // 아이디(이메일 형식)
  userID: string;

  @Prop() // 비밀번호 // TODO : 추후 암호화 필요
  userPassword: string;

  @Prop({ unique: true, trim: true }) // 닉네임
  name: string;

  @Prop() // 이메일
  email: string;

  @Prop({ default: 0 }) // 점수
  points: number;

  @Prop() // 인증 토큰
  jsonWebToken: string;

  @Prop({ default: 1 }) // 레벨
  level: number;

  @Prop({
    // 참여한 게시글들 // reference type
    type: [{ type: MongooseSchema.Types.ObjectId, ref: "Post" }],
    default: [],
  })
  participations: Post[];

  @Prop({ default: 2 }) // 성별(0: 남성, 1: 여성)
  gender: number;

  @Prop({ default: 0 }) // 출생 연도
  yearBirth: number;

  @Prop({ trim: true }) // 전화번호
  phoneNumber: string;

  //   @Prop({default: [] }) // 당첨 기프티콘들
  //   prizes: ;

  @Prop({ default: 0 }) // 마지막으로 확인한 경품 갯수(NEW 표시용)
  prize_check: number;

  @Prop() // 이메일 인증 여부
  email_confirmed: boolean;

  @Prop() // 비번 변경을 위한 이메일 인증 여부
  password_change: boolean;

  @Prop() // 비번 변경 이메일 인증 시간(1시간 지나면 다시 false로 바꾸기 위함)
  last_password_confirm_time: Date;

  @Prop() // Firebase cloud messaging을 위한 기기 토큰 저장
  fcm_token: string;

  @Prop({
    // 알림들
    type: [{ type: MongooseSchema.Types.ObjectId, ref: "Notification" }],
    default: [],
  })
  notifications: Notification[];

  @Prop() // 알림 허용
  notification_allow: boolean;

  @Prop({
    // 차단한 사용자들
    type: [{ type: MongooseSchema.Types.ObjectId, ref: "User" }],
    default: [],
  })
  blocked_users: User[];

  @Prop({
    // 내가 참여한 투표
    type: [{ type: MongooseSchema.Types.ObjectId, ref: "General" }],
    default: [],
  })
  general_participations: General[];

  @Prop({
    // 내가 작성한 투표
    type: [{ type: MongooseSchema.Types.ObjectId, ref: "General" }],
    default: [],
  })
  my_generals: General[];

  @Prop({
    // 내가 작성한 설문
    type: [{ type: MongooseSchema.Types.ObjectId, ref: "Post" }],
    default: [],
  })
  my_posts: Post[];

  @Prop()
  createdAt: Date;

  @Prop()
  loginAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
