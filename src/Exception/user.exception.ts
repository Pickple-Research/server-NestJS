import { Status403Exception } from "./Status";

export class UserEmailDuplicatedException {}

export class UserNotFoundException extends Status403Exception {
  constructor() {
    super({ error: "Cannot found matched UserID" });
  }
}
