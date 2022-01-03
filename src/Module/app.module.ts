import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from "@nestjs/config";
// import { AppController } from "../Controller/app.controller";
// import { AppService } from "../Service/app.service";
import { UserModule } from "./user.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // isGlobal : .env 파일 변수를 전역에서 사용할 수 있습니다
    MongooseModule.forRoot(process.env.MONGODB_ENDPOINT),
    UserModule,
  ],
  // controllers: [AppController],
  // providers: [AppService],
})
export class AppModule {}
