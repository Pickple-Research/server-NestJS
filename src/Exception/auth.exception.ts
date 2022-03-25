import { Status403Exception } from "./Status";

export class Custom403Exception extends Status403Exception {
  constructor() {
    super({ message: "PassWord not correct!" });
  }
}
