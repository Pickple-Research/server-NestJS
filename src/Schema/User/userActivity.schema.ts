import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema, Types } from "mongoose";
import {
  ParticipatedResearchInfo,
  ParticipatedResearchInfoSchema,
  ParticipatedVoteInfo,
  ParticipatedVoteInfoSchema,
} from "./Embedded";
import { Research } from "src/Schema";

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

  @Prop({ type: [String], default: [] }) // 스크랩한 리서치 _id
  scrappedResearchIds: string[];

  @Prop({ type: [String] }) // 참여한 리서치 _id
  participatedResearchIds: string[];

  @Prop({ type: [ParticipatedVoteInfoSchema], default: [] }) // 참여한 투표들 정보
  participatedVoteInfos: ParticipatedVoteInfo[];

  @Prop({ type: [String], default: [] }) // 작성한 리서치들 _id
  uploadedResearchIds: string[];

  @Prop({ type: [String], default: [] }) // 작성한 투표들 _id
  uploadedVoteIds: string[];
}

export const UserActivitySchema = SchemaFactory.createForClass(UserActivity);

export type UserActivityDocument = UserActivity & Document;
