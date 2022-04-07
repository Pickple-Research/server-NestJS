import {
  Controller,
  UseInterceptors,
  UploadedFiles,
  Query,
  Param,
  Headers,
  Body,
  Get,
  Post,
  Patch,
  Put,
  Delete,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { ResearchService } from "../../Service";
import { AwsS3Service } from "../../AWS";
import { ResearchCreateBodyDto } from "../../Dto";
import { getMulterOptions } from "../../Util";
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
  @Get("test")
  @Public()
  async testResearchRouter() {
    return await this.researchService.testResearchRouter();
  }

  /**
   * 최신 리서치를 원하는만큼 찾고 반환합니다.
   * get 인자가 주어지지 않은 경우 기본적으로 20개를 반환합니다.
   * @author 현웅
   */
  @Get("")
  @Public()
  async getRecentResearches(@Query() query: { get?: number }) {
    return await this.researchService.getRecentResearches(query?.get);
  }

  /**
   * 주어진 리서치 _id를 기준으로 하여 과거의 리서치 10개를 찾고 반환합니다.
   * TODO: 경로 이름을 뭘로 할까
   * @author 현웅
   */
  @Get()
  @Public()
  async getPaginatedResearches() {
    return;
  }

  /**
   * _id로 특정 리서치를 찾고 반환합니다.
   * 존재하지 않는 경우 exception을 일으킵니다.
   * @author 현웅
   */
  @Get(":researchId")
  @Public()
  async getResearchById(@Param() param: { researchId: string }) {
    return this.researchService.getResearchById(param.researchId);
  }

  // Post Requests
  /**
   * 새로운 리서치를 생성합니다.
   * 파일(썸네일, 본문 이미지)이 주어지는 경우, S3 버킷에 업로드합니다.
   * @author 현웅
   */
  @Post("")
  @Public()
  @UseInterceptors(
    //? Body에 "thumbnail" 혹은 "images" 라는 이름의 field를 가진 데이터(파일)가 있는 경우,
    //? 해당 데이터를 가로채 각각 @UploadedFiles() 의 thumbnail과 images 인자의 값으로 넘겨줍니다.
    //? 이 때 thumbnail 필드를 가진 데이터는 하나만, images 필드를 가진 데이터는 6개까지 허용합니다.
    //? 그 외 파일에 대한 제약 조건은 researchMulterOptions를 적용합니다. aws.constant.ts 파일을 참고하세요.
    FileFieldsInterceptor(
      [
        { name: "thumbnail", maxCount: 1 },
        { name: "images", maxCount: 6 },
      ],
      getMulterOptions(),
    ),
  )
  async createResearch(
    @UploadedFiles()
    files: {
      thumbnail?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
    @Body() researchCreateBodyDto: ResearchCreateBodyDto,
  ) {
    //* Body로 전달된 리서치 정보(와 파일(들))를 researchService로 넘깁니다.
    return await this.researchService.createResearch({
      ...researchCreateBodyDto,
      files: files,
    });
  }

  // Patch Requests

  // Put Requests

  // Delete Requests
}
