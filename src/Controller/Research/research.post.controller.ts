import {
  Controller,
  UseInterceptors,
  UploadedFiles,
  Body,
  Post,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { MongoResearchCreateService } from "src/Mongo";
import { ResearchCreateBodyDto } from "src/Dto";
import {
  getCurrentISOTime,
  getISOTimeAfterGivenDays,
  getMulterOptions,
} from "src/Util";

@Controller("researches")
export class ResearchPostController {
  constructor(
    private readonly mongoResearchCreateService: MongoResearchCreateService,
  ) {}

  /**
   * 새로운 리서치를 생성합니다.
   * 파일(썸네일, 본문 이미지)이 주어지는 경우, S3 버킷에 업로드합니다.
   * @author 현웅
   */
  @Post("")
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
    //* Body로 전달된 리서치 정보(와 파일(들))를 researchCreateService로 넘깁니다.
    return await this.mongoResearchCreateService.createResearch(
      {
        ...researchCreateBodyDto,
        createdAt: getCurrentISOTime(),
        //TODO: 기본 리서치 진행시간 상수화
        deadline: getISOTimeAfterGivenDays(3),
      },
      files,
    );
  }
}
