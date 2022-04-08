import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Notice, NoticeDocument } from "../../Schema";

@Injectable()
export class MongoNoticeFindService {
  constructor(
    @InjectModel(Notice.name) private readonly Notice: Model<NoticeDocument>,
  ) {}
}
