import { HttpStatus, HttpException } from "@nestjs/common";

export class Status403 extends HttpException {
  constructor(message: any) {
    super(message, HttpStatus.FORBIDDEN);
  }
}

export class Status500 extends HttpException {
  constructor(message: any) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
