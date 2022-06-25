import { Status401Exception } from "./Status";

/**
 * 주어진 인증번호가 미인증 유저의 인증번호와 일치하지 않는 경우 사용합니다.
 * 기본 message: `인증번호가 일치하지 않습니다`
 * @author 현웅
 */
export class WrongAuthorizationCodeException extends Status401Exception {
  constructor(newMessage?: string) {
    super({
      customMessage: newMessage ? newMessage : `인증번호가 일치하지 않습니다`,
    });
  }
}

/**
 * 이메일 회원가입을 진행하기 전에 해당 이메일이 인증된 상태인지 확인합니다.
 * 기본 message: `이메일이 인증되지 않았습니다`
 * @author 현웅
 */
export class EmailNotAuthorizedException extends Status401Exception {
  constructor(newMessage?: string) {
    super({
      customMessage: newMessage ? newMessage : `이메일이 인증되지 않았습니다`,
    });
  }
}

/**
 * 비밀번호가 일치하지 않는 경우 사용합니다.
 * 기본 message: `비밀번호가 일치하지 않습니다`
 * @author 현웅
 */
export class WrongPasswordException extends Status401Exception {
  constructor(newMessage?: string) {
    super({
      customMessage: newMessage ? newMessage : `비밀번호가 일치하지 않습니다`,
    });
  }
}

/**
 * Jwt가 만료되었거나 잘못된 형식인 경우 사용합니다.
 * 기본 message: `토큰이 만료되었거나 올바르지 않습니다`
 * @author 현웅
 */
export class InvalidJwtException extends Status401Exception {
  constructor(newMessage?: string) {
    super({
      customMessage: newMessage
        ? newMessage
        : `토큰이 만료되었거나 올바르지 않습니다`,
    });
  }
}
