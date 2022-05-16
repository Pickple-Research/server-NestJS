import { IsEnum, IsString } from "class-validator";
import { PartnerType, ProductType } from "src/Object/Enum";

/**
 * 파트너 생성 요청시 Body에 포함되어야 하는 정보들입니다.
 * @author 현웅
 */
export class PartnerCreateBodyDto {
  @IsString()
  partnerName: string;

  @IsEnum(PartnerType)
  partnerType: PartnerType;
}

/**
 * 파트너 게시글/이벤트 생성 요청시 Body에 포함되어야 하는 정보들입니다.
 * @author 현웅
 */
export class PartnerPostCreateBodyDto {
  @IsString()
  partnerId: string;

  @IsString()
  title: string;

  @IsString()
  content: string;
}

/**
 * 파트너 제품/서비스 생성 요청시 Body에 포함되어야 하는 정보들입니다.
 * @author 현웅
 */
export class PartnerProductCreateBodyDto {
  @IsString()
  partnerId: string;

  @IsString()
  productName: string;

  @IsString()
  description: string;

  @IsEnum(ProductType)
  productType: ProductType;
}
