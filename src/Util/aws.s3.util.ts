import { S3UploadingObject } from "../Object/Type";

/**
 * S3 버킷에 올릴 수 있는 형태의 Object를 반환합니다.
 * @author 현웅
 */
export function getS3UploadingObject(
  Bucket: string,
  file: Express.Multer.File,
  Key: string,
): S3UploadingObject {
  return {
    Bucket,
    Body: file.buffer,
    ACL: "private",
    Key,
  };
}
