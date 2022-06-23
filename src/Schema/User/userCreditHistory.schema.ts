import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * 크레딧 사용 내역 스키마입니다.
 * @author 현웅
 */
@Schema()
export class UserCreditHistory {
  @Prop() // 변동 사유 (줄글)
  reason: string;

  @Prop() // 변동 타입 (ex. 리서치 등록, 리서치 참여, 리서치 끌올 ...)
  type: string;

  @Prop() // 변동 액수
  scale: number;

  @Prop() // 변동 일시
  changedAt: string;

  @Prop() // 잔여 크레딧
  balance: number;
}

export const UserCreditHistorySchema =
  SchemaFactory.createForClass(UserCreditHistory);

export type UserCreditHistoryDocument = UserCreditHistory & Document;
