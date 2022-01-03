import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type BannerDocument = Banner & Document;

@Schema()
export class Banner {
  @Prop() // 타이틀
  title: string;

  @Prop() // 작성자
  author: string;

  @Prop() // 콘텐츠 내용 간략히 설명
  content: string;

  @Prop({ default: 0 }) // 배너 타입
  type: number;
  // 0: 공지사항
  // 1: 리서치
  // 2: 투표
  // 3: 서베이 tip
  // 4. 쿠폰
  // 5. 이벤트
  // 6. 웹 페이지

  @Prop() // 생성 날짜인듯 // TODO
  date: Date;

  @Prop() // 클릭시 이동 주소
  url: string;

  @Prop() // S3 버켓 주소
  image_url: string;

  @Prop({ default: false }) // 배너 숨김 여부
  hide: boolean;

  @Prop({ default: false }) // 리서치/이벤트 타입 배너인 경우 완료 여부인듯 // TODO
  done: boolean;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);
