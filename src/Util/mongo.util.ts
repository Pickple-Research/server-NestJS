import { ClientSession } from "mongoose";

/**
 * 데이터 정합성이 필요한 경우 사용하는 트랜젝션의 try-catch wrapper 함수입니다.
 * @param session DB 연결 인스턴스에서 시작한 session
 * @param func 정합성이 보장되어야 하는 기능들을 정의한 함수
 * @example
 * //* 함수 적용법
 * async deleteUser(){
 *  const session = await this.connection.startSession();
 *
 *  return tryTransaction(session, async()=>{
 *   const user = await this.userModel
 *    .findByIdAndDelete(userId)
 *    .populate('posts')
 *    .session(session);
 *   return user;
 *  })
 * }
 * @example
 * //* 원하는 곳에 session 넣는 법
 * //* 링크 참조: https://mongoosejs.com/docs/transactions.html
 * const someUser = await this.User.findOne({...options}).session(session)
 * await someUser.save()
 *
 * await this.User.create({...options}, {session})
 * ...
 * @author 현웅
 */
export async function tryTransaction<ReturnType>(
  session: ClientSession,
  func: () => Promise<ReturnType>,
) {
  //TODO?: sessinon.withTransaction을 이용하면 좀 더 코드가 간단해지긴 하는데..
  //* session을 통해 transaction을 시작합니다.
  session.startTransaction();
  try {
    //* 인자로 받은 callback 함수를 시행하고, 그 결과를 반환합니다.
    //* 에러가 없다면 변경사항을 승인합니다.
    const result = await func();
    await session.commitTransaction();
    return result;
  } catch (error) {
    //* 에러가 난 경우, 지금까지의 변경사항을 모두 되돌리고 해당 error를 반환합니다.
    await session.abortTransaction();
    throw error;
  } finally {
    //* 성공, 실패 모든 경우에 대해 session을 종료합니다.
    session.endSession();
  }
}
