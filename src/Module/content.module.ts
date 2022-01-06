import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ContentController } from "../Controller";
import { ContentService } from "../Service";
import { Content, ContentSchema } from "../Schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Content.name, schema: ContentSchema }]),
  ],
  controllers: [ContentController],
  providers: [ContentService],
})
export class ContentModule {}
