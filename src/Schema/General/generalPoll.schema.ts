import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type GeneralPollDocument = GeneralPoll & Document;

@Schema()
export class GeneralPoll {
  @Prop() // 항목 내용
  content: string;

  @Prop({ type: [String], default: [] }) // 항목 참여자들
  participatedUserIds: string[];

  @Prop({ type: [String], default: null }) // 이미지 url
  imageUrl: string[];
}

export const GeneralPollSchema = SchemaFactory.createForClass(GeneralPoll);
