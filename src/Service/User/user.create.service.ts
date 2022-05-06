import { Injectable, Inject } from "@nestjs/common";
import { MongoUserCreateService } from "../../Mongo";
import { UserSignupDto } from "../../Dto";

/**
 * 유저를 생성하는 서비스입니다.
 * @author 현웅
 */
@Injectable()
export class UserCreateService {
  constructor() {}

  @Inject() private readonly mongoUserCreateService: MongoUserCreateService;

  /**
   * @Post
   * @author 현웅
   */
  async createEmailUser() {
    //TODO: 추후 이 곳에서 userSignupDto의 내용에 UserType을 추가해줘야 합니다.
    return await this.mongoUserCreateService.createEmailUser();
  }
}
