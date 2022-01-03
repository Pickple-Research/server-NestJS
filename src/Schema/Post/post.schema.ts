import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { PostComment } from "..";

export type PostDocument = Post & Document;

@Schema()
export class Post {
  @Prop() // 제목
  title: string;

  @Prop() // 작성자
  author: string;

  @Prop() // 작성자 레벨
  author_lvl: number;

  @Prop() // 글 내용
  content: string;

  @Prop({ default: 0 }) // 참여자 수
  participants: number;

  @Prop({ default: 30 }) // 목표 참여자 수
  goal_participants: number;

  @Prop() // 설문 url
  url: string;

  @Prop() // 설문 게시 날짜
  date: Date;

  @Prop() // 설문 종료 날짜
  deadline: Date;

  @Prop({ default: false }) // 상품 유무
  with_prize: boolean;

  @Prop() // /상품 항목
  prize: string;

  @Prop() // 상품 추첨 인원
  num_prize: number;

  @Prop() // 소요 시간
  est_time: number;

  @Prop() // 설문 대상
  target: string;

  @Prop({
    // 댓글 리스트
    type: [{ type: MongooseSchema.Types.ObjectId, ref: "PostComment" }],
    default: [],
  })
  comments: PostComment[];

  @Prop({ default: false }) // 설문 마감
  done: boolean;

  @Prop({ type: [String], default: [] }) // 상품 저장된 url들
  prize_urls: string[];

  @Prop({ type: [String], default: [] }) // 참여한 유저 아이디들
  participants_userids: string[];

  @Prop({ default: 0 }) // 연장했는지 여부
  extended: number;

  @Prop()
  author_userid: string;

  @Prop({ default: false })
  hide: boolean;

  @Prop({ default: 0 })
  event: number;

  @Prop({ default: 0 })
  pinned: number;

  @Prop({ default: true })
  annonymous: boolean;

  @Prop()
  author_info: string;

  // @Prop({default: [] })
  // reports:

  // @Prop( {  defalut: [] })
  // report_reasons:;

  @Prop({ default: 0 }) // 참여자가 수가 거의 다 찼는지 확인
  almost: number;

  @Prop({ default: 0 }) // 조회수
  visit: number;

  @Prop({ default: 0 })
  credit: number;

  @Prop({ default: 0 })
  num_credit: number;
}

export const PostSchema = SchemaFactory.createForClass(Post);
