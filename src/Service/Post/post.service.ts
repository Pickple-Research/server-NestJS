import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Post, PostDocument } from "../../Schema";

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private readonly Post: Model<PostDocument>,
  ) {}

  async testPostRouter() {
    return;
  }
}
