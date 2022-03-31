import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { NoticeController } from "../Controller";
import { NoticeService } from "../Service";
import { MongoNoticeService } from "../Mongo";
import { Notice, NoticeSchema } from "../Schema";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Notice.name, schema: NoticeSchema }],
      "notice",
    ),
  ],
  controllers: [NoticeController],
  providers: [NoticeService, MongoNoticeService],
})
export class NoticeModule {}
