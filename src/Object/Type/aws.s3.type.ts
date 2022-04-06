/**
 * 파일 업로드시 파일 메타데이터
 * @author 현웅
 */
export type FilesType = {
  thumbnail?: Express.Multer.File;
  images?: Express.Multer.File[];
};

/**
 * S3 파일 업로드시 필요한 변수들
 * @author 현웅
 */
export type S3FileUploadOption = {
  bucketName: string;
  dataBuffer: Buffer;
  path: string;
  filename: string;
};
