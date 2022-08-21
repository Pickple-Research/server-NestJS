/** 리서치 소요시간 1분당 차감 크레딧 */
export const CREDIT_PER_MINUTE = (estimatedTime: number) => {
  return Math.floor((estimatedTime - 1) / 3) + 1;
};

/** 리서치 끌올에 필요한 크레딧 */
export const RESEARCH_PULLUP_CREDIT = 1;

/**
 * 리서치 자동 마감 CronJob 을 생성하고 ScheduleRegistry 에 등록할 때
 * 리서치의 _id 앞에 붙이는 문자열. 다음과 같이 사용합니다:
 *
 * @example
 * ```
 * try {
 *   const cronJobName = `RESEARCH_AUTO_CLOSE_CRONJOB_NAME(research._id)`;
 *   const cronJob = new CronJob(...);
 *   this.schedulerRegistry.addCronJob(cronJobName, cronJob);
 * } catch (error) {
 *   ...에러 처리...
 * }
 * ```
 *
 * @author 현웅
 */
export const RESEARCH_AUTO_CLOSE_CRONJOB_NAME = (researchId: string) =>
  `ResearchAutoClose: ${researchId}`;

/** 리서치 추가 크레딧 당첨 푸시 알림 제목 */
export const WIN_EXTRA_CREDIT_ALARM_TITLE = "추가 크레딧 당첨";

/** 리서치 추가 크레딧 당첨 푸시 알림 내용 */
export const WIN_EXTRA_CREDIT_ALARM_CONTENT = (param: {
  nickname: string;
  extraCredit: number;
}) =>
  `${param.nickname}님, ${param.extraCredit}만큼의 추가 크레딧에 당첨되었어요!\n\n마이페이지에 들어가 지금 확인해보세요!`;
