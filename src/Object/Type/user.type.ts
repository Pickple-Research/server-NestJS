/**
 * JWT 토큰에 담겨있는 정보입니다.
 * JWT Auth Guard를 통해 해석되어 Request에 담겨집니다.
 * @author 현웅
 */
export type RequestUser = {
  userId: string;
};
