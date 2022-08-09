import {
  IsString,
  IsNumber,
  IsNumberString,
  IsOptional,
} from "class-validator";

/**
 * 리서치를 조회/스크랩/스크랩 취소/마감할 때 Body 에 포함되어야 하는 정보들입니다.
 * @author 현웅
 */
export class ResearchInteractBodyDto {
  @IsString()
  researchId: string;
}

/**
 * 리서치 참여시 Body에 포함되어야 하는 정보들입니다.
 * @param consummedTime 리서치 참여 소요시간
 * @param title 리서치 제목 (리서치 참여 도중 삭제 시 대비)
 * @param credit 리서치 참여시 수령 크레딧 (리서치 참여 도중 삭제 시 대비)
 * @author 현웅
 */
export class ResearchParticiateBodyDto {
  @IsNumber()
  consummedTime: number;

  @IsString()
  researchId: string;

  @IsString()
  title: string;

  @IsNumber()
  credit: number;
}

/**
 * 리서치 정보 수정시 Body에 포함되어야 하는 정보들
 * @author 현웅
 */
export class ResearchEditBodyDto {
  @IsString()
  researchId: string;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsNumberString() // 참여시 추가 제공 크레딧 (추첨자에게만 제공)
  extraCredit: number;

  @IsNumberString() // 추가 제공 크레딧 추첨 수령자 수
  extraCreditReceiverNum: number;
}

/**
 * 리서치 끌올시 Body에 포함되어야 하는 정보들
 * @author 현웅
 */
export class ResearchPullupBodyDto {
  @IsString()
  researchId: string;

  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  content: string;

  @IsString()
  @IsOptional()
  deadline: string;

  @IsNumberString() // 참여시 추가 제공 크레딧 (추첨자에게만 제공)
  @IsOptional()
  extraCredit: number;

  @IsNumberString() // 추가 제공 크레딧 추첨 수령자 수
  @IsOptional()
  extraCreditReceiverNum: number;
}