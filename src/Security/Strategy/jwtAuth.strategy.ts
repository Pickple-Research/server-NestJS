import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy as PassportJwtStrategy, ExtractJwt } from "passport-jwt";

/**
 * Bearer Header에 담긴 Jwt로부터 유저 정보를 추출하는 Strategy입니다.
 * Bearer Header가 없거나, 유효한 Jwt가 아니면 401 에러를 반환합니다.
 * @author 현웅
 */
@Injectable()
export class JwtAuthStrategy extends PassportStrategy(
  PassportJwtStrategy,
  "jwt auth", // 이곳에서 정의한 Strategy를 Guard에 사용할 때 사용할 이름을 'jwt auth'로 설정합니다
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      //TODO: Jwt 만료시간 설정하고 만료된 경우 Access Token으로 갱신 요청 (auth.server.ts의 login() 참조)
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate() {
    const user = {
      email: "data from JwtAuthStrategy",
      password: "(encrypted)",
    };
    return user;
  }
}
