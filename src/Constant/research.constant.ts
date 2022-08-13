/** 리서치 소요시간 1분당 차감 크레딧 */
export const CREDIT_PER_MINUTE = 1;

/** 리서치 끌올에 필요한 크레딧 */
export const RESEARCH_PULLUP_CREDIT = 1;

/** 리서치 추가 크레딧 당첨 푸시 알림 제목 */
export const WIN_EXTRA_CREDIT_ALARM_TITLE = "추가 크레딧 당첨";

/** 리서치 추가 크레딧 당첨 푸시 알림 내용 */
export const WIN_EXTRA_CREDIT_ALARM_CONTENT = (param: {
  nickname: string;
  extraCredit: number;
}) =>
  `${param.nickname}님, ${param.extraCredit}만큼의 추가 크레딧에 당첨되었어요!\n\n마이페이지에 들어가 지금 확인해보세요!`;
