import { Injectable, Inject } from "@nestjs/common";
import { MongoUserUpdateService } from "src/Mongo";

@Injectable()
export class UserUpdateService {
  constructor() {}

  @Inject() private readonly mongoUserUpdateService: MongoUserUpdateService;
}
