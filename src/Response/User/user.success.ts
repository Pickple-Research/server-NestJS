import { SuccessResponse } from "..";

export class UserSignupSuccess extends SuccessResponse {
  message: string;

  constructor() {
    super();
    this.message = "Signup successed";
  }
}
