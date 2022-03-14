import { NestFactory } from "@nestjs/core";
import { AppModule } from "./App";
import { HttpExceptionFilter } from "./Exception/Filter";

/**
 * 서버를 시작하는 곳입니다.
 * AppModule을 import하여 app 객체를 만들고 최종적으로 실행합니다.
 * ***
 * 주요 기능:
 * - 모든 요청 주소에 globalPrefix를 추가합니다
 * - 모든 요청에 Exception Filter를 적용합니다.
 * ***
 * @author 현웅
 */
async function bootstrap() {
  //? AppModule을 import하고 app으로 만듭니다.
  const app = await NestFactory.create(AppModule);

  //? 모든 요청 주소 앞단에 "/api"를 추가합니다.
  app.setGlobalPrefix("/api");
  //? 모든 요청에 Exception Filter를 적용합니다.
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT || 5000);
}

bootstrap();
