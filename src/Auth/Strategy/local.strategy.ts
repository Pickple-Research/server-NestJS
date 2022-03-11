import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { UserService } from "../../Service";

/*
 * !# strategy !# local-strategy
 * ...extends PassportStrategy(Strategy) 형태만 사용하는 경우
 * body에 {username:string, password:string} 형식의 인자가 오는 것을 전제로 한다
 * (인자가 존재하지 않으면 validate() 함수를 거치지 않고 401 status code를 반환)
 * 인자 이름을 바꾸고 싶다면 super() 부분에서
 * {usernameField:'<field name>', passwordField:'<field name>'} 코드를 넣어 바꿔야 한다
 *
 * 공식문서 : https://docs.nestjs.com/security/authentication
 * 참조 : http://www.passportjs.org/concepts/authentication/strategies/
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({ usernameField: "email" });
  }

  async validate(email: string): Promise<any> {
    console.log("local strategy property confirmed");
    return email;
  }
}
