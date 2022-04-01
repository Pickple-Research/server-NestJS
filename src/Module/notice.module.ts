import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { NoticeController } from "../Controller";
import { NoticeService } from "../Service";
import { MongoNoticeService } from "../Mongo";
import { Notice, NoticeSchema } from "../Schema";
import { MONGODB_NOTICE_CONNECTION } from "../Constant";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Notice.name, schema: NoticeSchema }],
      MONGODB_NOTICE_CONNECTION,
    ),
  ],
  controllers: [NoticeController],
  providers: [NoticeService, MongoNoticeService],
})
export class NoticeModule {}
