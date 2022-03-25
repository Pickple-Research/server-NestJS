import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";
import { IS_PUBLIC } from "../Metadata";

/**
 * ./security.strategy.ts 파일의 JwtStrategy를 사용하는 Guard입니다.
 * 단, @Public() 데코레이터가 있는 요청은 통과시킵니다.
 * @author 현웅
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt auth") {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
