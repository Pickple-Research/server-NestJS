import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";
import { IS_PUBLIC } from "../Metadata";

/**
 * ./security.strategy.ts 파일의 JwtStrategy를 사용하는 Guard입니다.
 * 단, @Public() 데코레이터가 있는 요청은 통과시킵니다.
 * guard.module.ts#GuardModule 에서 import 되며,
 * GuardModule이 AppModule에 import 되면서 전역적으로 적용됩니다.
 *
 * @see https://docs.nestjs.com/security/authentication#enable-authentication-globally
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
    //* 호출되는 Controller의 함수의 메타데이터에 IS_PUBLIC 값이 설정되어있는지 확인합니다.
    //* (@Public() 데코레이터가 있는 경우 true로 설정됩니다.)
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);

    //* isPublic 값이 true로 설정되어 있다면 통과시킵니다
    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
