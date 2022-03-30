import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { NoticeController } from "../Controller";
import { NoticeService } from "../Service";
import { Notice, NoticeSchema } from "../OldSchema";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Notice.name, schema: NoticeSchema }],
      "main",
    ),
  ],
  controllers: [NoticeController],
  providers: [NoticeService],
})
export class NoticeModule {}
