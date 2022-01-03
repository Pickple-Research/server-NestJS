import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type ReplyDocument = Reply & Document;

@Schema()
export class Reply {
  @Prop()
  writer: string;

  @Prop()
  writer_name: string;

  @Prop()
  content: string;

  @Prop()
  date: Date;

  @Prop()
  replyID: string;

  // @Prop({default: [] })
  // reports: ;

  // @Prop({default: [] })
  // report_reasons: ;

  @Prop({ default: false })
  hide: boolean;
}

export const ReplySchema = SchemaFactory.createForClass(Reply);
