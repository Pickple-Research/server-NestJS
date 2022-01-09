import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Notice, NoticeDocument } from "../../Schema";

@Injectable()
export class NoticeService {
  constructor(
    @InjectModel(Notice.name) private readonly Notice: Model<NoticeDocument>,
  ) {}

  // Get Requests
  // 전체 공지 반환
  //# @Get()
  async getAllNotice() {
    return;
  }

  // Post Requests
  // 공지 생성
  //# @Post()
  async createNotice() {
    return;
  }

  // Put Requests
  // 공지 수정
  //# @Put()
  async updateNotice() {
    return;
  }

  // Delete Requests
  // 공지 삭제
  //# @Delete()
  async deleteNotice() {
    return;
  }
}
