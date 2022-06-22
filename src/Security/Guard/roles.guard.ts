import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common"
import { Reflector } from "@nestjs/core"

/**
 * userType을 검증하는 Guard입니다.
 * @Roles() 데코레이터가 붙어있으면 검사합니다. 
 * ex)@Roles("ADMIN") ADMIN만 접근 가능합니다.
 * body
 * {
 * user:{
 * userType:ADMIN
 * }}
 * 형식으로 보내주어야합니다. 
 */
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.get<string[]>("roles", context.getHandler())
        //  return false
        if (!roles) {
            return true// @Roles()가 없으면 통과
        }

        const request = context.switchToHttp().getRequest()
        const { body } = request
        const user = body.user
        return user && roles.includes(user.userType)//userType이 ADMIN이면 통과

    }
}