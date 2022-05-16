import { IsString } from "class-validator";

/**
 * 리서치 생성 요청시 Body에 포함되어야 하는 정보들입니다.
 * @author 현웅
 */
export class ResearchCreateBodyDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsString()
  target: string;

  @IsString()
  formUrl: string;

  @IsString()
  researcherId: string;
}
