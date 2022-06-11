import {
  Controller,
  Inject,
  UseInterceptors,
  UploadedFiles,
  Request,
  Body,
  Post,
} from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { MongoUserUpdateService, MongoResearchCreateService } from "src/Mongo";
import { getMulterOptions, tryTransaction } from "src/Util";
import { ResearchCreateBodyDto } from "src/Dto";
import { JwtUserInfo } from "src/Object/Type";
import {
  MONGODB_USER_CONNECTION,
  MONGODB_RESEARCH_CONNECTION,
} from "src/Constant";

@Controller("researches")
export class ResearchPostController {
  constructor(
    @InjectConnection(MONGODB_USER_CONNECTION)
    private readonly userConnection: Connection,
    @InjectConnection(MONGODB_RESEARCH_CONNECTION)
    private readonly researchConnection: Connection,
  ) {}

  @Inject()
  private readonly mongoUserUpdateService: MongoUserUpdateService;
  @Inject()
  private readonly mongoResearchCreateService: MongoResearchCreateService;

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
        // { name: "thumbnail", maxCount: 1 },
        { name: "images", maxCount: 6 },
      ],
      getMulterOptions(),
    ),
  )
  async createResearch(
    @Request() req: { user: JwtUserInfo },
    @Body() researchCreateBodyDto: ResearchCreateBodyDto,
    @UploadedFiles()
    files: {
      thumbnail?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
  ) {
    const userSession = await this.userConnection.startSession();
    const researchSession = await this.researchConnection.startSession();

    return await tryTransaction(async () => {
      const newResearchId =
        await this.mongoResearchCreateService.createResearch(
          // req.user.userId
          "62a2e7e94048ace3fc28b87e",
          researchCreateBodyDto,
          files,
          researchSession,
        );

      await this.mongoUserUpdateService.uploadResearch(
        "62a2e7e94048ace3fc28b87e",
        newResearchId,
        userSession,
      );

      return newResearchId;
    }, researchSession);
  }
}
