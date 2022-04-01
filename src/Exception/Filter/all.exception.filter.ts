import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { MongoError } from "mongodb";
import { CustomExceptionResonse } from "../Status";

/**
 * 에러 발생 시 로그와 응답객체를 관리합니다.
 * @author 현웅
 */
@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost) {
    let exceptionType: string = "OTHER";
    let status: number = 500;
    let code: string | number;
    let responseBody: any = {};

    const { httpAdapter } = this.httpAdapterHost;
    const httpArgumentsHost = host.switchToHttp();
    const request = httpArgumentsHost.getRequest<Request>();
    const response = httpArgumentsHost.getResponse<Response>();

    //* Http Exception인 경우
    if (exception instanceof HttpException) {
      exceptionType = "HTTP-EXCEPTION";
      status = exception.getStatus();
      responseBody = exception.getResponse() as CustomExceptionResonse;
    }

    //* Mongo Error인 경우
    //TODO: 대표적인 Mongo Error는 status code 설정
    else if (exception instanceof MongoError) {
      exceptionType = "MONGO-ERROR";
      code = exception.code;
    }

    //* 그 이외의 경우 (최악)
    //* 초기값인 exceptionType="OTHER", status 500을 그대로 활용
    //TODO: status code, message 어떻게?
    else {
    }

    //* 에러 내용 로깅
    console.error(
      `FAILED(${exceptionType}: ${
        exceptionType == "MONGO-ERROR" ? code : status
      }): [${request.method}] ${request.url}\n -> ${exception.name}: ${
        exception.message
      }`,
    );

    //* 반환
    httpAdapter.reply(response, responseBody, status);
  }
}
