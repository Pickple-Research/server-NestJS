import { Status403Exception } from "./Status";

export class UserEmailDuplicatedException {}

export class UserNotFoundException extends Status403Exception {
  constructor() {
    super({ message: "Cannot found matched UserID" });
  }
}
