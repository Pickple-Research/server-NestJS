import { Injectable } from "@nestjs/common";
import { S3, config } from "aws-sdk";

@Injectable()
export class AwsS3Service {
  private readonly s3: S3;

  constructor() {
    //?s3 서비스를 사용하도록 도와주는 객체를 만듭니다.
    this.s3 = new S3();

    //? AWS 서비스를 사용하기 위하여 IAM 인증을 진행합니다.
    //? (해당 유저는 Pickple-S3입니다. 주어진 권한은 AWS IAM 에서 확인할 수 있습니다.)
    config.update({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      region: process.env.AWS_REGION,
    });
  }

  /**
   * S3 버킷에 주어진 파일(들)을 업로드합니다.
   * (Controller에서 직접 호출하는 함수는 아닙니다)
   * TODO: Key값은 research 혹은 vote의 _id값을 포함해 설정
   * TODO: 에러 핸들링
   * @param dataBuffer 업로드할 파일(들)
   * @param filename
   * @author 현웅
   */
  async uploadFile(dataBuffer: Buffer, filename: string) {
    await this.s3
      .upload({
        Bucket: "pickple-research",
        Body: dataBuffer,
        ACL: "private",
        Key: `research-${filename}`,
        Metadata: { type: "thumbnail" },
      })
      .promise();
    return;
  }

  /**
   * research bucket에 파일을 업로드 합니다.
   * @author 현웅
   */
  async uploadResearchFile(files: {
    thumbnail?: Express.Multer.File[];
    images?: Express.Multer.File[];
  }) {
    const result = await Promise.all([
      this.uploadFile(files.thumbnail[0]?.buffer, "thumb"),
      files.images?.forEach((image, index) => {
        this.uploadFile(image.buffer, `image${index}`);
      }),
    ]);
    console.log(result.length);
    return;
  }

  async getResearchImage() {
    // const result = await this.s3
    //   .getObject({ Bucket: "pickple-research", Key: "research-thumb" })
    //   .promise();
    const listResult = await this.s3
      .listObjectsV2({ Bucket: "pickple-research", Prefix: "research-" })
      .promise();

    return;
  }
}
