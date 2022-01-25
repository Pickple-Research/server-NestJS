import { Prop, Schema } from "@nestjs/mongoose";

@Schema() // 댓글 공통 스키마
export class Comment {
  @Prop()
  userId: string;

  @Prop()
  userNickname: string;

  @Prop()
  content: string;

  @Prop()
  createdAt: Date;
}
