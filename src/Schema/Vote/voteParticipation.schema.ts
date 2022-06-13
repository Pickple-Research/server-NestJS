import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { VoteParticipantInfo, VoteParticipantInfoSchema } from "./Embedded";
import { VoteComment } from "./voteComment.schema";

/**
 * 투표 참여 정보 스키마입니다. 투표 기본 정보의 _id를 공유합니다.
 * @author 현웅
 */
@Schema()
export class VoteParticipation {
  @Prop({ type: [String], default: [] }) // 조회한 유저 _id
  viewedUserIds: string[];

  @Prop({ type: [String], default: [] }) // 스크랩한 유저 _id
  scrappedUserIds: string[];

  @Prop({ type: [VoteParticipantInfoSchema], default: [] }) // 참여한 유저 정보
  participantInfos: VoteParticipantInfo[];

  @Prop({
    type: [{ type: [MongooseSchema.Types.ObjectId], ref: "VoteComment" }],
    default: [],
  }) // 댓글 _id
  commentIds: VoteComment[];
}

export const VoteParticipationSchema =
  SchemaFactory.createForClass(VoteParticipation);

export type VoteParticipationDocument = VoteParticipation & Document;
