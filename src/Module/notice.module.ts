import { Module } from "@nestjs/common";
import { NoticeGetController } from "../Controller";
import { NoticeFindService } from "../Service";
import { MongoNoticeModule } from "../Mongo";

@Module({
  controllers: [NoticeGetController],
  providers: [NoticeFindService],
  imports: [MongoNoticeModule],
})
export class NoticeModule {}
