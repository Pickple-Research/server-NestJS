import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

/**
 * (유저가) 참여한 투표에 대한 정보 스키마입니다.
 * userActivity에서만 사용되는 임베드 스키마이므로 _id를 필요로 하지 않습니다.
 * @author 현웅
 */
@Schema({ _id: false })
export class ParticipatedVoteInfo {
  @Prop() // 참여한 투표의 _id
  voteId: string;

  @Prop() // 고른 선택지 인덱스들
  selectedOptionIndexes: number[];

  @Prop() // 참여 시각
  participatedAt: string;
}

export const ParticipatedVoteInfoSchema =
  SchemaFactory.createForClass(ParticipatedVoteInfo);
