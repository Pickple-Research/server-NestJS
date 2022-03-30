import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { Comment, Reply } from "..";

export type ContentCommentDocument = ContentComment & Document;

@Schema()
export class ContentComment {
  // #Independent Prop :
  @Prop({
    // 대댓글
    type: [{ type: MongooseSchema.Types.ObjectId, ref: "Reply" }],
    default: [],
  })
  reply: Reply[];

  @Prop({ default: false }) // 숨김 여부
  hide: boolean;

  // @Prop({default: [] }) // 신고
  // reports: ;

  // @Prop({default: [] }) // 신고 사유
  // report_reasons: ;

  @Prop() // 작성 일시
  createdAt: Date;

  // #Referencing Prop (참조하는 스키마의 id만 저장) :

  // #Partial Embedded Prop (참조하는 스키마 정보의 일부만 떼어내 저장) :

  // #Fully Embedded Prop (참조하는 스키마 정보를 모두 저장) :
}

export const ContentCommentSchema =
  SchemaFactory.createForClass(ContentComment);
