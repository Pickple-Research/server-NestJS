/**
 * 현재 한국 시간을 ISO 타입으로 반환합니다.
 * @author 현웅
 */
export function getCurrentISOTime() {
  const KOREA_GMT = new Date();
  KOREA_GMT.setHours(KOREA_GMT.getHours() + 9);
  return KOREA_GMT.toISOString();
}

/**
 * 인자로 받은 일 수 만큼의 미래 한국 시간을 ISO 타입으로 반환합니다.
 * 인자가 주어지지 않으면 3일 뒤의 시간을 반환합니다.
 * @author 현웅
 */
export function getISOTimeAfterGivenDays(days: number = 3) {
  const KOREA_GMT = new Date();
  KOREA_GMT.setHours(KOREA_GMT.getHours() + 9);
  KOREA_GMT.setDate(KOREA_GMT.getDate() + days);
  return KOREA_GMT.toISOString();
}

/**
 * 날짜와 일 수를 인자로 받아,
 * 해당 날짜로부터 주어진 일 수만큼의 미래 시간을 ISO 타입으로 반환합니다.
 * 일 수 인자가 주어지지 않으면 2일 뒤의 시간을 반환합니다.
 * @author 현웅
 */
export function getFutureDateFromGivenDate(
  date: string | Date,
  days: number = 2,
) {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate.toISOString();
}
