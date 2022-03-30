import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Gender } from "../../../Object/Enum";

export type UserDetailedInfoDocument = UserDetailedInfo & Document;

@Schema()
export class UserDetailedInfo {
  @Prop() // 유저 id
  userId: string;

  @Prop() // 출생 연도
  yearBirth: number;

  @Prop({ enum: Gender, default: Gender.UNDEFINED }) // 성별
  gender: Gender;
}

export const UserDetailedInfoSchema =
  SchemaFactory.createForClass(UserDetailedInfo);
