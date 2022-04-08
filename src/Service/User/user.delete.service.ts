import { Injectable, Inject } from "@nestjs/common";
import { MongoUserDeleteService } from "../../Mongo";

@Injectable()
export class UserDeleteService {
  constructor() {}

  @Inject() private readonly mongoUserDeleteService: MongoUserDeleteService;
}
