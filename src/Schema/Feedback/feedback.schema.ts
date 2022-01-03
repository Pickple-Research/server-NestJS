import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { FeedbackComment } from "./feedbackComment.schema";

export type FeedbackDocument = Feedback & Document;

@Schema()
export class Feedback {
  @Prop() // 제목
  title: string;

  @Prop() // 작성자
  author: string;

  @Prop() // 작성자 레벨
  author_lvl: number;

  @Prop() // 내용
  content: string;

  @Prop() // 날짜
  date: Date;

  @Prop() // 카테고리
  category: number;
  // 0 : 운영정책
  // 1 : 앱 구동 불편사항
  // 2 : 기능 추가/개선
  // 3 : 기타

  @Prop({
    // 댓글 // reference type
    type: [{ type: MongooseSchema.Types.ObjectId, ref: "FeedbackComment" }],
    default: [],
  })
  comments: FeedbackComment[];

  @Prop()
  author_userid: string;

  // @Prop({default:[]})
  // reports: ;

  @Prop({ default: false })
  hide: boolean;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
