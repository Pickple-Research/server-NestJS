import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

// 리서치에 참여한 유저 특성 정보 스키마
@Schema({ _id: false })
class ResearchParticipantInfo {
  @Prop({ required: true }) // 참여한 유저의 특성정보 _id
  userPropertyId: string;

  @Prop({ required: true }) // 리서치 참여에 걸린 시간
  consumedTime: string;

  @Prop({ required: true }) // 리서치에 참여한 시각
  participatedAt: string;
}

const ResearchParticipantInfoSchema = SchemaFactory.createForClass(
  ResearchParticipantInfo,
);

// 리서치를 조회한 유저 특성 정보 스키마 (스크랩한 유저 정보 스키마와 변수 이름만 다를 뿐 구조는 동일.)
@Schema({ _id: false })
class ResearchViewedUserInfo {
  @Prop({ required: true }) // 조회한 유저의 특성정보 _id
  userPropertyId: string;

  @Prop({ required: true }) // 조회한 시간
  viewedAt: string;
}

const ResearchViewedUserInfoSchema = SchemaFactory.createForClass(
  ResearchViewedUserInfo,
);

// 리서치를 스크랩한 유저 특성 정보 스키마 (조회한 유저 정보 스키마와 변수 이름만 다를 뿐 구조는 동일.)
@Schema({ _id: false })
class ResearchScrappedUserInfo {
  @Prop({ required: true }) // 스크랩한 유저의 특성정보 _id
  userPropertyId: string;

  @Prop({ required: true }) // 스크랩한 시간
  scrappedAt: string;
}

const ResearchScrappedUserInfoSchema = SchemaFactory.createForClass(
  ResearchScrappedUserInfo,
);

/**
 * 리서치 참여 정보 스키마입니다. 리서치 기본 정보의 _id를 공유합니다.
 * @author 현웅
 */
@Schema()
export class ResearchParticipation {
  @Prop({ type: [ResearchParticipantInfoSchema], default: [] }) // 참여한 유저
  participantInfos: ResearchParticipantInfo[];

  @Prop({ type: [ResearchViewedUserInfoSchema], default: [] }) // 조회한 유저
  viewedUserInfos: ResearchViewedUserInfo[];

  @Prop({ type: [ResearchScrappedUserInfoSchema], default: [] }) // 스크랩한 유저
  scrappedUserInfos: ResearchScrappedUserInfo[];
}

export const ResearchParticipationSchema = SchemaFactory.createForClass(
  ResearchParticipation,
);

export type ResearchParticipationDocument = ResearchParticipation & Document;
