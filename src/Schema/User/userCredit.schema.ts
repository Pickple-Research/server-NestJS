import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * 유저가 가진 크레딧 및 크레딧 변동 내역 _id 스키마입니다.
 * @author 현웅
 */
@Schema()
export class UserCredit {
  @Prop({ default: 0 }) // 크레딧
  credit: number;

  @Prop({ type: [String], default: [] }) // 크레딧 변동 사유 _id
  creditHistoryIds: string[];
}

export const UserCreditSchema = SchemaFactory.createForClass(UserCredit);

export type UserCreditDocument = UserCredit & Document;
