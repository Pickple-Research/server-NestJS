import { IsString, IsNumber, IsNumberString } from "class-validator";

/**
 * 리서치 생성 요청시 Body에 포함되어야 하는 정보들입니다.
 * @param title 리서치 제목
 * @param link 폼 링크 url
 * @param content 리서치 내용
 * @param target 타겟
 * @author 현웅
 */
export class ResearchCreateBodyDto {
  @IsString() // 리서치 제목
  title: string;

  @IsString() // 설문지 폼 url
  link: string;

  @IsString() // 리서치 내용
  content: string;

  // @IsEnum() // 리서치 목적
  // purpose: string;

  @IsString() // 리서치 진행 단체
  organization: string;

  @IsString() // 참여 대상 (줄글 작성)
  target: string;

  @IsNumberString() // 예상 소요시간
  estimatedTime: number;
}
