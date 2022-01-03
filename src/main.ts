import { NestFactory } from "@nestjs/core";
import { AppModule } from "./Module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 모든 요청 주소 앞단에 "/api"를 추가합니다
  app.setGlobalPrefix("/api");

  await app.listen(process.env.PORT || 5000);
}

bootstrap();
