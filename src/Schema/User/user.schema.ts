import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import {
  ParticipatedResearch,
  ParticipatedResearchSchema,
} from "./PartialEmbeddedSchema/user.participatedResearch.schema";
import {
  ParticipatedVote,
  ParticipatedVoteSchema,
} from "./PartialEmbeddedSchema/user.participatedVoteSchema";

export type UserDocument = User & Document;

@Schema()
export class User {
  // #Independent Prop :
  @Prop({ required: true, unique: true, trim: true }) // 이메일
  email: string;

  @Prop({ required: true }) // 비밀번호
  password: string;

  @Prop({ unique: true, trim: true }) // 닉네임
  nickname: string;

  @Prop() // 인증 토큰
  jsonWebToken: string;

  @Prop() // Firebase cloud messaging을 위한 기기 토큰 저장
  fcmToken: string;

  @Prop({ default: 1 }) // 레벨
  level: number;

  @Prop({ default: 0 }) // 점수
  point: number;

  @Prop() // 이메일 인증 여부
  emailConfirmed: boolean;

  @Prop() // 비번 변경을 위한 이메일 인증 여부 (??)
  passwordChanged: boolean;

  @Prop({ default: true }) // 알림 허용
  allowNotification: boolean;

  @Prop() // 회원가입 일시
  signUpAt: Date;

  @Prop() // 마지막 로그인 일시
  lastLoginAt: Date;

  @Prop() // 비번 변경 이메일 인증 시간 (1시간 지나면 다시 false로 바꾸기 위함)
  lastPasswordConfirmedTime: Date;

  // #Referencing Prop (참조하는 스키마의 id만 저장) :
  @Prop() // 유저 별 알림에 대한 정보들을 갖고 있는 스키마 id
  userNotificationId: string;

  @Prop() // 유저 별 세부 정보를 담고 있는 스키마 id
  userDetailedInfoId: string;

  @Prop({ type: [String], default: [] }) // 차단한 유저 id
  blockedUserIds: string[];

  @Prop({ type: [String], default: [] }) // 내가 작성한 설문 id
  myResearchIds: string[];

  @Prop({ type: [String], default: [] }) // 내가 작성한 투표 id
  myVoteIds: string[];

  // #Partial Embedded Prop (참조하는 스키마 정보의 일부만 떼어내 저장) :
  @Prop({ type: [ParticipatedResearchSchema], default: [] }) // 참여한 리서치 정보
  participatedResearchs: ParticipatedResearch[];

  @Prop({ type: [ParticipatedVoteSchema], default: [] }) // 참여한 투표 정보
  participatedVotes: ParticipatedVote[];

  // #Fully Embedded Prop (참조하는 스키마 정보를 모두 저장) :
}

export const UserSchema = SchemaFactory.createForClass(User);
