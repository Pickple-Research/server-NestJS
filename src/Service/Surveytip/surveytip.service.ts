import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Surveytip, SurveytipDocument } from "../../Schema";

@Injectable()
export class SurveytipService {
  constructor(
    @InjectModel(Surveytip.name)
    private readonly Surveytip: Model<SurveytipDocument>,
  ) {}

  async testSurveytipRouter() {
    return;
  }
}
