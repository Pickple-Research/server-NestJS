import { Status404Exception } from "./Status";

export class ResearchNotFoundException extends Status404Exception {
  constructor() {
    super({ customMessage: "삭제되었거나 존재하지 않는 리서치입니다." });
  }
}
