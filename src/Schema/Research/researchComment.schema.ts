import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

// 리서치 대댓글 스키마
@Schema()
class Reply {
  @Prop({ required: true }) // 대상 댓글
  commentId: string;

  @Prop({ required: true }) // 대댓글 내용
  content: string;

  @Prop({ required: true }) // 대댓글 작성자 닉네임
  nickname: string;

  @Prop({ required: true }) // 대댓글 작성 일자
  createdAt: string;
}

const ReplySchema = SchemaFactory.createForClass(Reply);

// 리서치 댓글 스키마
@Schema()
class Comment {
  @Prop({ required: true }) // 댓글 내용
  content: string;

  @Prop({ required: true }) // 댓글 작성자 닉네임
  nickname: string;

  @Prop({ required: true }) // 댓글 작성 일자
  createdAt: string;

  @Prop({ type: [ReplySchema], default: [] }) // 대댓글들
  replies: Reply[];
}

const CommentSchema = SchemaFactory.createForClass(Comment);

/**
 * 리서치 댓글(들)을 담은 스키마입니다. 리서치 기본 정보의 _id를 공유합니다.
 * @author 현웅
 */
@Schema()
export class ResearchComment {
  @Prop({ type: [CommentSchema], default: [] })
  comments: Comment[];
}

export const ResearchCommentSchema =
  SchemaFactory.createForClass(ResearchComment);

export type ResearchCommentDocument = ResearchComment & Document;
