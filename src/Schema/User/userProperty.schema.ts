import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Gender } from "../../Object/Enum";

export type UserPropertyDocument = UserProperty & Document;

/**
 * 유저 특성 정보 스키마입니다.
 * 리서치나 투표 참여시 유저 계정 정보 대신 이 정보를 넘겨줍니다.
 * User 스키마의 _id를 공유합니다.
 * @author 현웅
 */
@Schema()
export class UserProperty {
  @Prop({ enum: Gender }) // 성별
  gender: Gender;

  @Prop() // 출생년도
  birthYear: number;

  @Prop() // 수입
  income: number;

  @Prop() // 거주지
  residence: string;
}

export const UserPropertySchema = SchemaFactory.createForClass(UserProperty);
