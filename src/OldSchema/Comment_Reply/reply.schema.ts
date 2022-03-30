import { Prop, Schema } from "@nestjs/mongoose";

@Schema() // 대댓글 공통 스키마
export class Reply {
  @Prop()
  userId: string;

  @Prop()
  userNickname: string;

  @Prop()
  content: string;

  // @Prop({default: [] })
  // reports: ;

  // @Prop({default: [] })
  // report_reasons: ;

  @Prop({ default: false })
  hide: boolean;

  @Prop()
  createdAt: Date;
}
