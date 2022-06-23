import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * 투표 작성자, 투표 (대)댓글 작성자 정보를
 * populate를 통해 동적으로 가져오기 위해 사용되는 스키마입니다.
 * 유저가 생성될 때 _id 를 공유하며 같이 만들어지고, 수정 역시 일괄적으로 적용됩니다.
 * @author 현웅
 */
@Schema()
export class VoteUser {
  @Prop() // 유저 닉네임
  nickname: string;
}

export const VoteUserSchema = SchemaFactory.createForClass(VoteUser);

export type VoteUserDocument = VoteUser & Document;
