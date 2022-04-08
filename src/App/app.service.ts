import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  async healthCheck() {
    return "App health check";
  }
}
