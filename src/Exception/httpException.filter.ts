import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch(HttpException)
class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    console.log("http exception filter is working");

    response.status(status).json({
      statusCode: status,
      path: request.url,
      message: exception.message,
    });
  }
}

export const httpExceptionFilter = new HttpExceptionFilter();
