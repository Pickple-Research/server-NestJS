/**
 * 현재 한국 시간을 ISO 타입으로 반환합니다.
 * @author 현웅
 */
export function getCurrentISOTime() {
  const KOREA_GMT = new Date();
  KOREA_GMT.setHours(KOREA_GMT.getHours() + 9);
  return KOREA_GMT.toISOString();
}
