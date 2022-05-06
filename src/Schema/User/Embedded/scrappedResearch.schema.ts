import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

/**
 * (유저가) 스크랩한 리서치에 대한 정보 스키마입니다.
 * userActivity에서만 사용되는 임베드 스키마이므로 _id를 필요로 하지 않습니다.
 * @author 현웅
 */
@Schema({ _id: false })
export class ScrappedResearchInfo {
  @Prop() // 스크랩한 리서치의 _id
  researchId: string;

  @Prop() // 스크랩한 리서치 제목
  title: string;

  @Prop() // 스크랩 시각
  scrappedAt: string;
}

export const ScrappedResearchInfoSchema =
  SchemaFactory.createForClass(ScrappedResearchInfo);
