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
import {
  ResearchCreateBodyDto,
  ResearchCommentCreateBodyDto,
  ResearchReplyCreateBodyDto,
} from "src/Dto";
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
   * 이미지가 포함되지 않은 새로운 리서치를 생성합니다.
   * @return 생성된 리서치 정보
   * @author 현웅
   */
  @Post("")
  async createResearch(
    @Request() req: { user: JwtUserInfo },
    @Body() researchCreateBodyDto: ResearchCreateBodyDto,
  ) {
    const userSession = await this.userConnection.startSession();
    const researchSession = await this.researchConnection.startSession();

    return await tryTransaction(async () => {
      const newResearch = await this.mongoResearchCreateService.createResearch(
        // req.user.userId
        "62a2e7e94048ace3fc28b87e",
        researchCreateBodyDto,
        {},
        researchSession,
      );

      await this.mongoUserUpdateService.uploadResearch(
        // req.user.userId
        "62a2e7e94048ace3fc28b87e",
        newResearch._id,
        userSession,
      );

      return newResearch;
    }, researchSession);
  }

  /**
   * 이미지 파일이 포함된 새로운 리서치를 생성합니다.
   * (로직은 createResearch와 동일합니다)
   * 이미지는 S3 버킷에 업로드됩니다.
   * @return 생성된 리서치 정보
   * @author 현웅
   */
  @Post("images")
  @UseInterceptors(
    //? FormData에 "thumbnail" 혹은 "images" 라는 이름의 field를 가진 데이터(파일)가 있는 경우,
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
  async createResearchWithImages(
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
      const newResearch = await this.mongoResearchCreateService.createResearch(
        // req.user.userId
        "62a2e7e94048ace3fc28b87e",
        researchCreateBodyDto,
        files,
        researchSession,
      );

      await this.mongoUserUpdateService.uploadResearch(
        // req.user.userId
        "62a2e7e94048ace3fc28b87e",
        newResearch._id,
        userSession,
      );

      return newResearch;
    }, researchSession);
  }

  /**
   * @Transaction
   * 리서치 댓글을 작성합니다.
   * @return 생성된 리서치 댓글
   * @author 현웅
   */
  @Post("comments")
  async uploadResearchComment(
    @Request() req: { user: JwtUserInfo },
    @Body() body: ResearchCommentCreateBodyDto,
  ) {
    const researchSession = await this.researchConnection.startSession();

    return await tryTransaction(async () => {
      const newComment =
        await this.mongoResearchCreateService.createResearchComment(
          {
            researchId: body.researchId,
            // authorId: req.user.userId,
            authorId: "req.user.userId",
            authorNickname: "req.user.userNickname",
            content: body.content,
          },
          researchSession,
        );

      return newComment;
    }, researchSession);
  }

  /**
   * @Transaction
   * 리서치 대댓글을 작성합니다.
   * @return 생성된 리서치 대댓글
   * @author 현웅
   */
  @Post("replies")
  async uploadResearchReply(
    @Request() req: { user: JwtUserInfo },
    @Body() body: ResearchReplyCreateBodyDto,
  ) {
    const researchSession = await this.researchConnection.startSession();

    return await tryTransaction(async () => {
      const newReply =
        await this.mongoResearchCreateService.createResearchReply(
          {
            researchId: body.researchId,
            commentId: body.commentId,
            // authorId: req.user.userId,
            authorId: "req.user.userId",
            authorNickname: "req.user.userNickname",
            content: body.content,
          },
          researchSession,
        );

      return newReply;
    }, researchSession);
  }
}
