import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Content, ContentDocument } from "../../Schema";

@Injectable()
export class ContentService {
  constructor(
    @InjectModel(Content.name) private readonly Content: Model<ContentDocument>,
  ) {}

  async testContentRouter() {
    return;
  }
}
