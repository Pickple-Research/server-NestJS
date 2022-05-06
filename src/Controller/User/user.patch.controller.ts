import { Controller, Patch } from "@nestjs/common";
import { UserUpdateService } from "src/Service";

@Controller("users")
export class UserPatchController {
  constructor(private readonly userUpdateService: UserUpdateService) {}
}
