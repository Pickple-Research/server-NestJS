import { IsString, IsOptional } from "class-validator";

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
  /** 이메일 */
  @IsString()
  email: string;

  /** 성 */
  @IsString()
  lastName: string;

  /** 이름 */
  @IsString()
  name: string;

  /** 비밀번호 */
  @IsString()
  password: string;

  /** 닉네임 */
  @IsString()
  nickname: string;

  /** 생년월일 */
  @IsString()
  @IsOptional()
  birthday?: string;

  /** 성별 */
  @IsString()
  gender: string;
}

/**
 * (로그인 이후) 유저의 크레딧 사용내역과
 * 스크랩/참여/업로드한 리서치 및 투표 정보를 요청시
 * Body에 포함되어야 하는 정보들입니다.
 * @param scrappedResearchIds
 * @param participatedResearchIds
 * @param scrappedVoteIds
 * @param participatedVoteIds
 * @author 현웅
 */
export class UserActivityBodyDto {
  @IsString({ each: true })
  scrappedResearchIds: string[];

  @IsString({ each: true })
  participatedResearchIds: string[];

  @IsString({ each: true })
  scrappedVoteIds: string[];

  @IsString({ each: true })
  participatedVoteIds: string[];
}
