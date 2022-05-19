/**
 * CORS 허용 주소들
 * @author 현웅
 */
export const CORS_ORIGINS = ["*"];

/**
 * DB 연결 이름
 * @author 현웅
 */
export const MONGODB_FEEDBACK_CONNECTION = "MONGODB_FEEDBACK_CONNECTION";
export const MONGODB_NOTICE_CONNECTION = "MONGODB_NOTICE_CONNECTION";
export const MONGODB_PARTNER_CONNECTION = "MONGODB_PARTNER_CONNECTION";
export const MONGODB_RESEARCH_CONNECTION = "MONGODB_RESEARCH_CONNECTION";
export const MONGODB_USER_CONNECTION = "MONGODB_USER_CONNETION";
export const MONGODB_VOTE_CONNECTION = "MONGODB_VOTE_CONNECTION";

/**
 * EC2 인스턴스 health check 경로
 * (logging.interceptor에서 로그 생략 조건으로 사용)
 * @author 현웅
 */
export const healthCheckUrl = "/health";
