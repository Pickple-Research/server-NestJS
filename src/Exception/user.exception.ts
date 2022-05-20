import {
  Status400Exception,
  Status401Exception,
  Status403Exception,
} from "./Status";

/**
 * 주어진 조건의 유저가 존재하지 않는 상황을 Exception으로 규정해야 하는 경우 사용합니다.
 * 기본 message: '유저가 존재하지 않습니다'
 * @author 현웅
 */
export class UserNotFoundException extends Status403Exception {
  constructor(newMessage?: string) {
    super({
      customMessage: newMessage ? newMessage : `유저가 존재하지 않습니다`,
    });
  }
}

/**
 * 중복된 이메일로 회원가입을 시도하는 경우 사용합니다.
 * 기본 message: '이미 사용 중인 이메일입니다'
 * @author 현웅
 */
export class EmailDuplicateException extends Status400Exception {
  constructor(newMessage?: string) {
    super({
      customMessage: newMessage ? newMessage : `이미 사용 중인 이메일입니다`,
    });
  }
}
