import { Controller, Headers, Delete } from "@nestjs/common";
import { UserDeleteService } from "src/Service";

/**
 * User 데이터에 대한 delete method 요청들을 처리하는 Controller입니다.
 * delete method 의 인자는 Header에 넣어져 전달됩니다.
 * @author 현웅
 */
@Controller("users")
export class UserDeleteController {
  constructor(private readonly userDeleteService: UserDeleteService) {}

  /**
   * User 데이터를 삭제합니다.
   * @author 현웅
   */
  @Delete("")
  async deleteUserById(@Headers() headers: { _id: string }) {
    return await this.userDeleteService.deleteUserById(headers._id);
  }
}
