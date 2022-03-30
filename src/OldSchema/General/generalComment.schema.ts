import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { Comment, Reply } from "..";

export type GeneralCommentDocument = GeneralComment & Document;

@Schema()
export class GeneralComment {
  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: "Reply" }],
    default: [],
  })
  reply: Reply[];

  @Prop({ default: false })
  hide: boolean;

  // @Prop({default: [] })
  // reports:

  // @Prop({default: [] })
  // report_reasons: ;
}

export const GeneralCommentSchema =
  SchemaFactory.createForClass(GeneralComment);
