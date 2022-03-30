import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Comment } from "..";

export type FeedbackCommentDocument = FeedbackComment & Document;

@Schema()
export class FeedbackComment {
  // #Independent Prop :
  @Prop()
  userId: string;

  @Prop()
  userNickname: string;

  @Prop()
  content: string;

  // @Prop({default:[]})
  // reports:

  @Prop({ default: false })
  hide: boolean;

  @Prop()
  createdAt: Date;

  // #Referencing Prop (참조하는 스키마의 id만 저장) :

  // #Partial Embedded Prop (참조하는 스키마 정보의 일부만 떼어내 저장) :

  // #Fully Embedded Prop (참조하는 스키마 정보를 모두 저장) :
}

export const FeedbackCommentSchema =
  SchemaFactory.createForClass(FeedbackComment);
