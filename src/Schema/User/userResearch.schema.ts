import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import {
  ParticipatedResearchInfo,
  ParticipatedResearchInfoSchema,
} from "./Embedded";

/**
 * 유저의 조회/스크랩/참여/업로드한 리서치 정보 스키마입니다.
 * @author 현웅
 */
@Schema()
export class UserResearch {
  @Prop({ type: [String], default: [] }) // 조회한 리서치 _id
  viewedResearchIds: string[];

  @Prop({ type: [String], default: [] }) // 스크랩한 리서치 _id
  scrappedResearchIds: string[];

  @Prop({ type: [ParticipatedResearchInfoSchema], default: [] }) // 참여한 리서치들 정보
  participatedResearchInfos: ParticipatedResearchInfo[];
}

export const UserResearchSchema = SchemaFactory.createForClass(UserResearch);

export type UserResearchDocument = UserResearch & Document;
