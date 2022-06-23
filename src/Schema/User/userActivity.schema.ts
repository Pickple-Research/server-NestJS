import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { UserCreditHistory } from "./userCreditHistory.schema";
import {
  ParticipatedResearchInfo,
  ParticipatedResearchInfoSchema,
  ParticipatedVoteInfo,
  ParticipatedVoteInfoSchema,
} from "./Embedded";

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

  @Prop({ type: [String], default: [] }) // 스크랩한 투표 _id
  scrappedVoteIds: string[];

  @Prop({ type: [ParticipatedResearchInfoSchema], default: [] }) // 참여한 리서치들 정보
  participatedResearchInfos: ParticipatedResearchInfo[];

  @Prop({ type: [ParticipatedVoteInfoSchema], default: [] }) // 참여한 투표들 정보
  participatedVoteInfos: ParticipatedVoteInfo[];

  @Prop({ type: [String], default: [] }) // 작성한 리서치들 _id
  uploadedResearchIds: string[];

  @Prop({ type: [String], default: [] }) // 작성한 투표들 _id
  uploadedVoteIds: string[];

  @Prop({ default: 0 }) // 크레딧
  credit: number;

  @Prop({
    type: [{ type: [MongooseSchema.Types.ObjectId], ref: "UserCreditHistory" }],
    default: [],
  }) // 크레딧 변동 사유 _id
  creditHistoryIds: UserCreditHistory[];
}

export const UserActivitySchema = SchemaFactory.createForClass(UserActivity);

export type UserActivityDocument = UserActivity & Document;
