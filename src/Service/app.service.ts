import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  helloworld(): string {
    return "Hello World!";
  }
}
