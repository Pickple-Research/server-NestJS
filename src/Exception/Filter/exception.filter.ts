import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from "@nestjs/common";
import { Request, Response } from "express";
import { CustomExceptionResonse } from "../Status";

/**
 * HttpException이 발생했을 때의 처리 방식을 지정합니다.
 * 현재는 main.ts에서 import하여 모든 요청에 적용되도록 설정해두었지만,
 * 특정 Router / Controller에서만 사용하도록 지정할 수도 있습니다.
 * @author 현웅
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  //? argumentsHost: handler에게 전달된 모든 arguments들을 가지고 있는 객체. (req, res, next 등)
  //?     getArgs(), getArgByIndex(), getType() 등의 함수를 사용하여 요청에 담긴 정보들을 읽어낼 수 있음.
  catch(exception: HttpException, argumentsHost: ArgumentsHost) {
    const httpArgumentsHost = argumentsHost.switchToHttp();
    const request = httpArgumentsHost.getRequest<Request>();
    const response = httpArgumentsHost.getResponse<Response>();
    const status = exception.getStatus();

    //TODO: status 500 이상 에러 핸들링 추가
    if (status >= 500) {
    }

    //TODO: Http Exception 이외의 에러 핸들링 추가

    response.status(status).json({
      statusCode: status,
      path: request.url,
      response: exception.getResponse() as CustomExceptionResonse,
    });
  }
}
