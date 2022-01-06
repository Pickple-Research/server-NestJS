import { Status403 } from "..";

export class DuplicateUserIdException {}

export class UserNotFoundError extends Status403 {
  constructor() {
    super("Cannot found matched UserID");
  }
}
