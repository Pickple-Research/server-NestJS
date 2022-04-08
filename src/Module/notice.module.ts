import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { NoticeGetController } from "../Controller";
import { NoticeFindService } from "../Service";
import { MongoNoticeFindService } from "../Mongo";
import { Notice, NoticeSchema } from "../Schema";
import { MONGODB_NOTICE_CONNECTION } from "../Constant";

@Module({
  controllers: [NoticeGetController],
  providers: [NoticeFindService, MongoNoticeFindService],
  imports: [
    MongooseModule.forFeature(
      [{ name: Notice.name, schema: NoticeSchema }],
      MONGODB_NOTICE_CONNECTION,
    ),
  ],
})
export class NoticeModule {}
