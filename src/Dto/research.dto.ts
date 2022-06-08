import { IsString } from "class-validator";

/**
 * 리서치 생성 요청시 Body에 포함되어야 하는 정보들입니다.
 * @param title 리서치 제목
 * @param content 리서치 내용
 * @param target 타겟
 * @param link 폼 링크 url
 * @author 현웅
 */
export class ResearchCreateBodyDto {
  @IsString()
  title: string;

  @IsString()
  link: string;

  @IsString()
  content: string;

  @IsString()
  target: string;
}
