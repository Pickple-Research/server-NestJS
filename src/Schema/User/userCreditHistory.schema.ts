import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
class CreditHistory {
  @Prop() // 변동 사유
  reason: string;

  @Prop() // 변동 액수
  scale: number;

  @Prop() // 변동 일시
  changedAt: string;

  @Prop() // 잔여 크레딧
  balance: number;
}

const CreditHistorySchema = SchemaFactory.createForClass(CreditHistory);

/**
 * 크레딧 사용 내역 스키마입니다.
 * @author 현웅
 */
@Schema()
export class UserCreditHistory {
  @Prop({ type: [CreditHistorySchema], default: [] })
  hitory: CreditHistory[];
}

export const UserCreditHistorySchema =
  SchemaFactory.createForClass(UserCreditHistory);

export type UserCreditHistoryDocument = UserCreditHistory & Document;
