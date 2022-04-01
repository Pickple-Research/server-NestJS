/**
 * 유저 성별
 * @author 현웅
 */
export enum Gender {
  UNDEFINED = "UNDEFINED",
  MALE = "MALE",
  FEMALE = "FEMALE",
}

/**
 * 유저 타입: 일반 사용자, 고객, 파트너, 테스트 사용자/고객/파트너, 관리자
 * @author 현웅
 */
export enum UserType {
  USER = "USER",
  CUSTOMER = "CUSTOMER",
  PARTNER = "PARTNER",
  TEST_USER = "TEST_USER",
  TEST_CUSTOMER = "TEST_CUSTOMER",
  TEST_PARTNER = "TEST_PARTNER",
  ADMIN = "ADMIN",
}

/**
 * 계정 타입: 회원가입 방식
 * @author 현웅
 */
export enum AccountType {
  EMAIL = "EMAIL",
  KAKAO = "KAKAO",
  GOOGLE = "GOOGLE",
  NAVER = "NAVER",
}
