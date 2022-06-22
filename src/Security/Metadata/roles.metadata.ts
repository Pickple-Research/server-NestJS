import { SetMetadata } from "@nestjs/common";

/**
 * 
 * @Roles() Guard에 대한 메타 데이터 생성
 * 
 */
export const Roles = (...roles: string[]) => SetMetadata("roles", roles);