import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "../../Schema";
import { AccountType, UserType } from "../../Object/Enum";
import { tryTransaction } from "../../Util";
import { UserNotFoundException } from "../../Exception";

@Injectable()
export class MongoUserDeleteService {
  constructor(
    @InjectModel(User.name) private readonly User: Model<UserDocument>,
  ) {}
}
