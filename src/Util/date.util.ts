/**
 * 현재 한국 시간을 ISO 타입으로 반환합니다.
 * @author 현웅
 */
export function getCurrentISOTime() {
  // const KOREA_GMT = new Date();
  // KOREA_GMT.setHours(KOREA_GMT.getHours() + 9);
  // return KOREA_GMT.toISOString();
  return new Date().toISOString();
}

/**
 * 인자로 받은 날짜가 경과하였는지 반환합니다.
 * 경과한 경우 true, 그렇지 않은 경우 false 를 반환합니다.
 * @author 현웅
 */
export function didDatePassed(date: string | Date) {
  return new Date(date) < new Date();
}

/**
 * 인자로 받은 분 수 만큼의 미래 한국 시간을 ISO 타입으로 반환합니다.
 * 인자가 주어지지 않으면 30분 뒤의 시간을 반환합니다.
 * @author 현웅
 */
export function getISOTimeAfterGivenMinutes(minutes: number = 30) {
  // const KOREA_GMT = new Date();
  // KOREA_GMT.setHours(KOREA_GMT.getHours() + 9);
  // KOREA_GMT.setDate(KOREA_GMT.getMinutes() + minutes);
  // return KOREA_GMT.toISOString();
  const now = new Date();
  now.setMinutes(now.getMinutes() + minutes);
  return now.toISOString();
}

/**
 * 인자로 받은 일 수 만큼의 미래 한국 시간을 ISO 타입으로 반환합니다.
 * 인자가 주어지지 않으면 3일 뒤의 시간을 반환합니다.
 * @author 현웅
 */
export function getISOTimeAfterGivenDays(days: number = 3) {
  // const KOREA_GMT = new Date();
  // KOREA_GMT.setHours(KOREA_GMT.getHours() + 9);
  // KOREA_GMT.setDate(KOREA_GMT.getDate() + days);
  // return KOREA_GMT.toISOString();
  const now = new Date();
  now.setDate(now.getDate() + days);
  return now.toISOString();
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
