import { Injectable } from "@nestjs/common";
import { MongoUserDeleteService } from "../../Mongo";

@Injectable()
export class UserDeleteService {
  constructor(
    private readonly mongoUserDeleteService: MongoUserDeleteService,
  ) {}
}
