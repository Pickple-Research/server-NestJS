import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { Reply } from "..";

export type ContentCommentDocument = ContentComment & Document;

@Schema()
export class ContentComment {
  @Prop() // UserSchema.email
  writer: string;

  @Prop() // UserSchema.name (닉네임)
  writer_name: string;

  @Prop() // 답글 내용
  content: string;

  @Prop() // 작성 일시
  date: Date;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: "Reply" }],
    default: [],
  }) // 대댓글
  reply: Reply[];

  @Prop({ default: false }) // 숨김 여부
  hide: boolean;

  // @Prop({default: [] }) // 신고
  // reports: ;

  // @Prop({default: [] }) // 신고 사유
  // report_reasons: ;
}

export const ContentCommentSchema =
  SchemaFactory.createForClass(ContentComment);
