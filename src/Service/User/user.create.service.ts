import { Injectable } from "@nestjs/common";
import { MongoUserCreateService } from "../../Mongo";
import { UserSignupDto } from "../../Dto";

@Injectable()
export class UserCreateService {
  constructor(
    private readonly mongoUserCreateService: MongoUserCreateService,
  ) {}

  /**
   * @Post
   * @author 현웅
   */
  async create() {
    return await this.mongoUserCreateService.createNewUser();
  }
}
