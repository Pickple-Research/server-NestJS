import { Controller, Get } from "@nestjs/common";
import { AppService } from "../Service/app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @Get("/helloworld")
  // getHello(): string {
  //   return this.appService.helloWorld();
  // }
}
