import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type FeedbackCommentDocument = FeedbackComment & Document;

@Schema()
export class FeedbackComment {
  @Prop()
  writer: string;

  @Prop()
  content: string;

  @Prop()
  date: Date;

  // @Prop({default:[]})
  // reports:

  @Prop({ default: false })
  hide: boolean;
}

export const FeedbackCommentSchema =
  SchemaFactory.createForClass(FeedbackComment);
