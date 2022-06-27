import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { compareSync } from "bcrypt";
import { Model } from "mongoose";
import { SurBayUserDocument } from "src/Schema";

@Injectable()
export class MongoSurBayService {
  constructor(
    @InjectModel("User")
    private readonly SurBayUser: Model<SurBayUserDocument>,
  ) {}

  async surBayLogin(param: { email: string; password: string }) {
    const surBayUser = await this.SurBayUser.findOne({ userID: param.email })
      .select({
        migrated: 1,
        userPassword: 1,
      })
      .lean();

    if (surBayUser.migrated) {
      console.log("유저 데이터가 이미 픽플리로 이관되었습니다");
      return;
    }

    if (!compareSync(param.password, surBayUser.userPassword)) {
      console.log("비밀번호가 일치하지 않습니다");
      return;
    }

    const migratingUser = await this.SurBayUser.findOneAndUpdate(
      { userID: param.email },
      { $set: { migrated: true } },
    )
      .select({
        userID: 1,
        userPassword: 1,
        name: 1,
        points: 1,
        level: 1,
        gender: 1,
        yearBirth: 1,
        phoneNumber: 1,
        createdAt: 1,
      })
      .lean();

    console.log(`user data:`);
    console.dir(migratingUser);
  }
}
