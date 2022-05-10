import { Status400Exception, Status404Exception } from "./Status";

/**
 * 리서치가 존재하지 않는 상황을 Exception으로 규정해야 하는 경우 사용합니다.
 * 기본 message: `삭제되었거나 존재하지 않는 리서치입니다`
 * @author 현웅
 */
export class ResearchNotFoundException extends Status404Exception {
  constructor(newMessage?: string) {
    super({
      customMessage: newMessage
        ? newMessage
        : "삭제되었거나 존재하지 않는 리서치입니다",
    });
  }
}

/**
 * 이미 참여한 리서치에 참여를 시도하는 경우 사용합니다.
 * 기본 message: `이미 참여한 리서치입니다`
 * @author 현웅
 */
export class AlreadyParticipatedResearchException extends Status400Exception {
  constructor(newMessage?: string) {
    super({
      customMessage: newMessage ? newMessage : "이미 참여한 리서치입니다",
    });
  }
}
