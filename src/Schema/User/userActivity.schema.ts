import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import {
  ParticipatedResearchInfo,
  ParticipatedResearchInfoSchema,
  ParticipatedVoteInfo,
  ParticipatedVoteInfoSchema,
} from "./Embedded";

export type UserActivityDocument = UserActivity & Document;

/**
 * 유저 활동(리서치나 투표 참여/조회/스크랩) 정보 스키마입니다.
 * @author 현웅
 */
@Schema()
export class UserActivity {
  @Prop({ type: [String], default: [] }) // 조회한 리서치 _id
  viewedResearchIds: string[];

  @Prop({ type: [String], default: [] }) // 조회한 투표 _id
  viewedVoteIds: string[];

  @Prop({ type: [ParticipatedResearchInfoSchema], default: [] }) // 스크랩한 리서치들 정보
  scrappedResearchInfos: ParticipatedResearchInfo[];

  //TODO: 이 스키마도 나중에 가면 너무 커질 우려가 있음. 15개 이후에는 id reference만 하는 건 아떤지?
  @Prop({ type: [ParticipatedResearchInfoSchema], default: [] }) // 참여한 리서치들 정보
  participatedResearchInfos: ParticipatedResearchInfo[];

  @Prop({ type: [ParticipatedVoteInfoSchema], default: [] }) // 참여한 투표들 정보
  participatedVoteInfos: ParticipatedVoteInfo[];
}

export const UserActivitySchema = SchemaFactory.createForClass(UserActivity);
