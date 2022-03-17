import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { tap, catchError } from "rxjs/operators";
import { CustomExceptionResonse } from "../Exception/Status";

/**
 * 모든 요청에 대해 로그를 남기는 인터셉터입니다. 로그는 아래 내용을 포함합니다:
 * - 요청 처리 소요 시간
 * - HTTP method
 * - request path
 * - (에러가 난 경우) 에러 메세지
 * @author 현웅
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  //? ExecutionContext: ArgumentsHost를 상속받고 기능이 추가된 클래스입니다.
  //?     exception.filter.ts 파일을 참고하세요.
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    //* Request 객체 저장
    const httpArgs = context.switchToHttp();
    const req = httpArgs.getRequest<Request>();
    //* 최종적으로 핸들러에 넘기기 전 시간 저장
    const onStartHandleDate = Date.now();

    return next.handle().pipe(
      //* 요청 응답이 성공적인 경우
      tap(() => {
        console.log(
          `SUCCESS: [${req.method}] ${req.url} - ${
            Date.now() - onStartHandleDate
          }ms`,
        );
      }),

      //* 요청 처리 중 에러가 발생한 경우
      catchError((error: HttpException) => {
        const customExceptionResponse =
          error.getResponse() as CustomExceptionResonse;
        //TODO: 에러 종류에 따라 분기 (error, warn 선택)
        console.error(
          `FAILED: [${req.method}] ${req.url} - ${customExceptionResponse.error}`,
        );
        return throwError(() => error);
      }),
    );
  }
}
