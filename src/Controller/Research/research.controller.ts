import {
  Controller,
  UseInterceptors,
  UploadedFiles,
  Headers,
  Body,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  UploadedFile,
} from "@nestjs/common";
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from "@nestjs/platform-express";
import { ResearchService } from "../../Service";
import { AwsS3Service } from "../../AWS";
import { researchMulterOptions } from "../../Constant";
import { Public } from "../../Security/Metadata";

@Controller("researches")
export class ResearchController {
  constructor(
    private readonly researchService: ResearchService,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  // Get Requests
  /**
   * 테스트 라우터
   * @author 현웅
   */
  @Get("")
  @Public()
  async testResearchRouter() {
    return await this.researchService.testResearchRouter();
  }

  @Get("thumb")
  @Public()
  async getS3Data() {
    return await this.awsS3Service.getResearchImage();
  }

  // Post Requests
  /**
   * 리서치를 업로드 합니다.
   * 파일(썸네일, 본문 이미지)이 주어지는 경우, S3 버킷에 업로드합니다.
   * 파일 형식, 크기 등에 대한 제약 조건은 aws.constant.ts#multerOptions를 참고하세요.
   * @author 현웅
   */
  @Post("")
  @Public()
  @UseInterceptors(
    //? Body에 "thumbnail" 혹은 "images" 라는 이름의 field를 가진 데이터가 있는 경우,
    //? 해당 데이터를 가로채 각각 @UploadedFiles() 의 thumbnail과 images 인자의 값으로 넘겨줍니다.
    //? thumbnail 필드를 가진 데이터는 하나만, images 필드를 가진 데이터는 6개까지 허용합니다.
    FileFieldsInterceptor([
      { name: "thumbnail", maxCount: 1 },
      { name: "images", maxCount: 6 },
    ]),
  )
  uploadResearch(
    @UploadedFiles()
    files: {
      thumbnail?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
  ) {
    return this.awsS3Service.uploadResearchFile(files);
  }

  // Patch Requests

  // Put Requests

  // Delete Requests
}
