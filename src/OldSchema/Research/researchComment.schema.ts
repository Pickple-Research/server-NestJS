import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type ResearchCommentDocument = ResearchComment & Document;

@Schema()
export class ResearchComment {
  @Prop()
  writer: string;

  @Prop()
  content: string;

  @Prop()
  date: Date;

  @Prop({ default: false })
  hide: boolean;

  // @Prop({default: [] })
  // reports:;

  // @Prop({default: [] })
  // report_reasons: ;
}

export const ResearchCommentSchema =
  SchemaFactory.createForClass(ResearchComment);
