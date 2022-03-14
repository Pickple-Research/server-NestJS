import { Status403Exception } from "./Status";

export class Custom403Exception extends Status403Exception {
  constructor() {
    super({ error: "PassWord not correct!" });
  }
}
