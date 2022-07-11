import { IsString } from "class-validator";

/**
 * 이메일을 사용한 최초 회원가입 요청시 (즉, 미인증 유저 생성시)
 * Body에 포함되어야 하는 정보들입니다.
 * @param email

 * @author 현웅
 */
export class EmailUnauthorizedUserSignupBodyDto {
  @IsString()
  email: string;
}

/**
 * 인증 완료된 이메일을 사용하여 실제 회원가입 요청시
 * Body에 포함되어야 하는 정보들입니다.
 * @param password
 * @author 현웅
 */
export class EmailUserSignupBodyDto {
  @IsString()
  email: string;

  /** 성 */
  @IsString()
  lastName: string;

  /** 이름 */
  @IsString()
  name: string;

  @IsString()
  password: string;
}

/**
 * (로그인 이후) 유저의 크레딧 사용내역과
 * 스크랩/참여/업로드한 리서치 및 투표 정보를 요청시
 * Body에 포함되어야 하는 정보들입니다.
 * @param creditHistoryIds
 * @param scrappedResearchIds
 * @param participatedResearchIds
 * @param uploadedResearchIds
 * @param scrappedVoteIds
 * @param participatedVoteIds
 * @param uploadedVoteIds
 * @author 현웅
 */
export class UserActivityBodyDto {
  @IsString({ each: true })
  creditHistoryIds: string[];

  @IsString({ each: true })
  scrappedResearchIds: string[];

  @IsString({ each: true })
  participatedResearchIds: string[];

  @IsString({ each: true })
  uploadedResearchIds: string[];

  @IsString({ each: true })
  scrappedVoteIds: string[];

  @IsString({ each: true })
  participatedVoteIds: string[];

  @IsString({ each: true })
  uploadedVoteIds: string[];
}
