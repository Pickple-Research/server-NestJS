import { Body, Controller, Get, Post } from "@nestjs/common";
import { PostService } from "../../Service";
// import { Post } from "../../Schema";

@Controller("post")
export class PostController {
  constructor(private readonly postService: PostService) {}

  // Get Requests
  // 테스트 API
  @Get("")
  async testPostRouter() {
    return await this.postService.testPostRouter();
  }
}
