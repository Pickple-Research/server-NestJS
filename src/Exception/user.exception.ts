import { Status400Exception, Status403Exception } from "./Status";

/**
 * 유저 본인이 아닌 사람이 유저 탈퇴를 요청한 경우 사용합니다.
 * 기본 message: '권한이 없습니다'
 * @author 현웅
 */
export class NotSelfRequestException extends Status400Exception {
  constructor(newMessage?: string) {
    super({
      customMessage: newMessage ? newMessage : "권한이 없습니다",
    });
  }
}

/**
 * 크레딧이 충분하지 않을 때 발생하는 에러입니다.
 * 기본 message: '크레딧이 부족합니다'
 * @author 현웅
 */
export class NotEnoughCreditException extends Status400Exception {
  constructor(newMessage?: string) {
    super({
      customMessage: newMessage ? newMessage : "크레딧이 부족합니다",
    });
  }
}

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
