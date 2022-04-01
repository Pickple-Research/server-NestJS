import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import {
  ParticipatedResearchInfo,
  ParticipatedResearchInfoSchema,
} from "./Embedded";

export type UserActivityDocument = UserActivity & Document;

/**
 * 유저 활동 정보 스키마입니다.
 * 참여하거나 좋아요 표시한 리서치/투표에 대한 간략한 정보를 담습니다.
 * @author 현웅
 */
@Schema()
export class UserActivity {
  //TODO: 이 스키마도 나중에 가면 너무 커질 우려가 있음. 15개 이후에는 id reference만 하는 건 아떤지?
  @Prop({ type: [ParticipatedResearchInfoSchema], default: [] }) // 참여한 리서치 정보
  participatedResearchInfos: ParticipatedResearchInfo[];
}

export const UserActivitySchema = SchemaFactory.createForClass(UserActivity);
