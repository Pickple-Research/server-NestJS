import { NestFactory } from "@nestjs/core";
import { AppModule } from "./App";
import { CORS_ORIGINS } from "./Constant";

/**
 * 서버를 시작하는 곳입니다.
 * AppModule을 import하여 app 객체를 만들고 최종적으로 실행합니다.
 * ***
 * 주요 기능:
 * - CORS 설정
 * - 모든 요청 주소에 globalPrefix를 추가합니다. ('/api')
 * ***
 * @author 현웅
 */
async function bootstrap() {
  //? AppModule을 import하고 app으로 만듭니다.
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    //TODO: CORS WHITE LIST 작성
    //? origin - 정의된 웹사이트에서 온 요청만을 처리합니다.
    //? credentials: true - 응답 헤더에 Access-Control-Allow-Credentials 를 추가합니다.
    origin: CORS_ORIGINS,
    credentials: true,
  });
  //? 모든 요청 주소 앞단에 "/api"를 추가합니다.
  app.setGlobalPrefix("/api");

  await app.listen(process.env.PORT || 5000);
}

bootstrap();
