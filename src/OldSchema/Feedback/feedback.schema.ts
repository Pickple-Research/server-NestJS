import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { FeedbackComment } from "./feedbackComment.schema";
import { FeedbackCategory } from "../../Object/Enum";

export type FeedbackDocument = Feedback & Document;

@Schema()
export class Feedback {
  // #Independent Prop :
  @Prop() // 작성자 id
  userId: string;

  @Prop() // 제목
  title: string;

  @Prop() // 내용
  content: string;

  @Prop() // 작성자 레벨
  userLevel: number;

  @Prop({ default: false })
  hide: boolean;

  @Prop({ enum: FeedbackCategory }) // 카테고리
  feedbackCategory: FeedbackCategory;

  @Prop() // 생성 날짜
  createdAt: Date;

  // #Referencing Prop (참조하는 스키마의 id만 저장) :

  // #Partial Embedded Prop (참조하는 스키마 정보의 일부만 떼어내 저장) :

  // #Fully Embedded Prop (참조하는 스키마 정보를 모두 저장) :
  @Prop({
    // 댓글 // reference type
    type: [{ type: MongooseSchema.Types.ObjectId, ref: "FeedbackComment" }],
    default: [],
  })
  comments: FeedbackComment[];
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
