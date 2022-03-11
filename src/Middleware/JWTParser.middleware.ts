import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class JWTParserMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log("middleware is working");
    next();
  }
}
