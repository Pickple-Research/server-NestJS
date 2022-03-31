import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type FeedbackDocument = Feedback & Document;

@Schema()
export class Feedback {
  @Prop({ required: true }) // 피드백 제목
  title: string;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
