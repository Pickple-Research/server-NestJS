import { Status403Exception } from "./Status";

export class UserEmailDuplicatedException {}

/**
 * 주어진 조건의 유저가 존재하지 않는 상황을 Exception으로 규정해야 하는 경우 사용합니다.
 * 기본적인 message는 '유저가 존재하지 않습니다' 이지만,
 * 다른 메세지를 constructor로 지정할 수도 있습니다.
 * @author 현웅
 */
export class UserNotFoundException extends Status403Exception {
  constructor(newMessage?: string) {
    super({ message: newMessage ? newMessage : `유저가 존재하지 않습니다` });
  }
}
