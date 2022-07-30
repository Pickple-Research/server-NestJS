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
 * 유저 타입: 일반 사용자, 테스터, 관리자
 * @author 현웅
 */
export enum UserType {
  USER = "USER",
  TESTER = "TESTER",
  PARTNER = "PARTNER",
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

/**
 * 크레딧 변동 사유
 * @author 현웅
 */
export enum CreditHistoryType {
  RESEARCH_PARTICIPATE = "RESEARCH_PARTICIPATE",
  RESEARCH_UPLOAD = "RESEARCH_UPLOAD",
  RESEARCH_PULLUP = "RESEARCH_PULLUP",
  MIGRATE = "MIGRATE",
}
