import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { ParticipatedVoteInfo, ParticipatedVoteInfoSchema } from "./Embedded";

/**
 * 유저의 조회/스크랩/참여/업로드한 투표 정보 스키마입니다.
 * @author 현웅
 */
@Schema()
export class UserVote {
  @Prop({ type: [String], default: [] }) // 조회한 투표 _id
  viewedVoteIds: string[];

  @Prop({ type: [String], default: [] }) // 스크랩한 투표 _id
  scrappedVoteIds: string[];

  @Prop({ type: [ParticipatedVoteInfoSchema], default: [] }) // 참여한 투표들 정보
  participatedVoteInfos: ParticipatedVoteInfo[];
}

export const UserVoteSchema = SchemaFactory.createForClass(UserVote);

export type UserVoteDocument = UserVote & Document;
