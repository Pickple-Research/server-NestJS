import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Banner, BannerDocument } from "../../Schema";

@Injectable()
export class BannerService {
  constructor(
    @InjectModel(Banner.name) private readonly Banner: Model<BannerDocument>,
  ) {}

  async testBannerRouter() {
    return;
  }
}
