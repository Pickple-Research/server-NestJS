import { HttpStatus, HttpException } from "@nestjs/common";

/**
 * Custom Exception에 추가로 담을 정보 형태를 지정합니다.
 * @author 현웅
 */
export type CustomExceptionResonse = {
  message: string;
};

export class Status403Exception extends HttpException {
  constructor(customExceptionResponse: CustomExceptionResonse) {
    super(customExceptionResponse, HttpStatus.FORBIDDEN);
  }
}

export class Status500Exception extends HttpException {
  constructor(customExceptionResponse: CustomExceptionResonse) {
    super(customExceptionResponse, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
