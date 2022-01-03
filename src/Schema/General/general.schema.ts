import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { GeneralComment } from "./generalComment.schema";
import { GeneralPoll } from "./generalPoll.schema";

export type GeneralDocument = General & Document;

@Schema()
export class General {
  @Prop() // 제목
  title: string;

  @Prop() // 작성자
  author: string;

  @Prop() // 작성자 레벨
  author_lvl: number;

  @Prop() // 글 내용
  content: string;

  @Prop() // 게시 날짜
  date: Date;

  @Prop()
  deadline: Date;

  @Prop({
    // 댓글 리스트 // reference type
    type: [{ type: MongooseSchema.Types.ObjectId, ref: "GeneralComment" }],
    default: [],
  })
  comments: GeneralComment[];

  @Prop({ default: false }) // 설문 마감
  done: boolean;

  @Prop() // 작성자 id
  author_userid: string;

  @Prop() // 복수 응답 가능
  multi_response: Boolean;

  @Prop({ default: 0 }) // 참여자 수
  participants: number;

  @Prop({ type: [String], default: [] }) // 참여한 유저 아이디들
  participants_userids: string[];

  @Prop() // 사진 유무
  with_image: boolean;

  @Prop({
    // 설문 항목들
    type: [{ type: MongooseSchema.Types.ObjectId, ref: "GeneralPoll" }],
    default: [],
  })
  polls: GeneralPoll[];

  @Prop({ type: [String], default: [] }) // 좋아요 누른 유저들(아이디)
  liked_users: string[];

  @Prop({ default: 0 })
  likes: { type: number };

  @Prop({ default: false })
  hide: boolean;

  //   @Prop({ default: [] }) // 신고
  //   reports: ;

  //   @Prop({ default: [] })
  //   report_reasons: ;

  @Prop({ default: false }) // 기획투표 유무
  special: boolean;

  @Prop({ default: 0 }) // 조회수
  visit: number;
}

export const GeneralSchema = SchemaFactory.createForClass(General);
