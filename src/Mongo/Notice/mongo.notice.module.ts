import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MongoNoticeFindService } from "./mongo.notice.find.service";
import { Notice, NoticeSchema } from "../../Schema";
import { MONGODB_NOTICE_CONNECTION } from "../../Constant";

@Module({
  providers: [MongoNoticeFindService],
  imports: [
    MongooseModule.forFeature(
      [{ name: Notice.name, schema: NoticeSchema }],
      MONGODB_NOTICE_CONNECTION,
    ),
  ],
  exports: [MongoNoticeFindService],
})
export class MongoNoticeModule {}
