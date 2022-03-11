import { Status403 } from "./Status";

export class DuplicateUserIdException {}

export class UserNotFoundError extends Status403 {
  constructor() {
    super("Cannot found matched UserID");
  }
}
