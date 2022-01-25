import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { GeneralComment } from "./generalComment.schema";
import { GeneralPoll } from "./generalPoll.schema";

export type GeneralDocument = General & Document;

@Schema()
export class General {
  // #Independent Prop :
  @Prop() // 작성자 id
  userId: string;

  @Prop() // 작성자 닉네임
  userNickname: string;

  @Prop() // 제목
  title: string;

  @Prop() // 글 내용
  content: string;

  @Prop() // 작성자 레벨
  userLevel: number;

  @Prop({ default: false }) // 기획투표 유무
  special: boolean;

  @Prop() // 복수 선택 가능
  allowMultiChoice: boolean;

  @Prop({ default: false }) // 숨김 여부
  hide: boolean;

  @Prop() // 만료 날짜
  deadline: Date;

  @Prop() // 게시 날짜
  createdAt: Date;

  // #Referencing Prop (참조하는 스키마의 id만 저장) :
  @Prop({ type: [String], default: [] }) // 조회한 유저 id
  viewedUserIds: string[];

  @Prop({ type: [String], default: [] }) // 참여한 유저 id
  participatedUserIds: string[];

  @Prop({ type: [String], default: [] }) // 좋아요 누른 유저 id
  likedUserIds: string[];

  // #Partial Embedded Prop (참조하는 스키마 정보의 일부만 떼어내 저장) :

  // #Fully Embedded Prop (참조하는 스키마 정보를 모두 저장) :
  @Prop({
    // 댓글 리스트 // reference type
    type: [{ type: MongooseSchema.Types.ObjectId, ref: "GeneralComment" }],
    default: [],
  })
  comments: GeneralComment[];

  @Prop({
    // 설문 항목들
    type: [{ type: MongooseSchema.Types.ObjectId, ref: "GeneralPoll" }],
    default: [],
  })
  polls: GeneralPoll[];

  //   @Prop({ default: [] }) // 신고
  //   reports: ;

  //   @Prop({ default: [] })
  //   report_reasons: ;
}

export const GeneralSchema = SchemaFactory.createForClass(General);
