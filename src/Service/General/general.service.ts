import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { General, GeneralDocument } from "../../Schema";

@Injectable()
export class GeneralService {
  constructor(
    @InjectModel(General.name) private readonly General: Model<GeneralDocument>,
  ) {}

  async testGeneralRouter() {
    return;
  }
}
