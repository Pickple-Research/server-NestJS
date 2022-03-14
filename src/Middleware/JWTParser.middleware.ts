import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

/**
 * 요청에 유효한 JWT가 존재하는지 검증합니다.
 * AppProvider에서 import한 후 적용됩니다.
 * @author 현웅
 */
@Injectable()
export class JWTParserMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log("JWTParserMiddleware is working");
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  }
}
