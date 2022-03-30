import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { Reply } from "..";

export type ResearchCommentDocument = ResearchComment & Document;

@Schema()
export class ResearchComment {
  @Prop()
  writer: string;

  @Prop()
  content: string;

  @Prop()
  date: Date;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: "Reply" }],
    default: [],
  })
  reply: Reply[];

  @Prop({ default: false })
  hide: boolean;

  // @Prop({default: [] })
  // reports:;

  // @Prop({default: [] })
  // report_reasons: ;
}

export const ResearchCommentSchema =
  SchemaFactory.createForClass(ResearchComment);
