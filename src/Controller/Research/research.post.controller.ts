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
import { Research, CreditHistory } from "src/Schema";
import { UserUpdateService } from "src/Service";
import { MongoUserFindService, MongoResearchCreateService } from "src/Mongo";
import {
  getCurrentISOTime,
  getMulterOptions,
  tryMultiTransaction,
} from "src/Util";
import {
  ResearchCreateBodyDto,
  ResearchCommentCreateBodyDto,
  ResearchReplyCreateBodyDto,
  ResearchReportBodyDto,
} from "src/Dto";
import { JwtUserInfo } from "src/Object/Type";
import {
  CREDIT_PER_MINUTE,
  MONGODB_USER_CONNECTION,
  MONGODB_RESEARCH_CONNECTION,
} from "src/Constant";
// import { getDummyResearches } from "src/Dummy";

@Controller("researches")
export class ResearchPostController {
  constructor(
    private readonly userUpdateService: UserUpdateService,

    @InjectConnection(MONGODB_USER_CONNECTION)
    private readonly userConnection: Connection,
    @InjectConnection(MONGODB_RESEARCH_CONNECTION)
    private readonly researchConnection: Connection,
  ) {}

  @Inject()
  private readonly mongoUserFindService: MongoUserFindService;
  @Inject()
  private readonly mongoResearchCreateService: MongoResearchCreateService;

  /**
   * 이미지가 포함되지 않은 새로운 리서치를 생성합니다.
   * @return 생성된 리서치, CreditHistory 정보
   * @author 현웅
   */
  @Post("")
  async createResearch(
    @Request() req: { user: JwtUserInfo },
    @Body() body: ResearchCreateBodyDto,
  ) {
    //* 유저가 가진 credit 을 가져옵니다
    const userCredit = await this.mongoUserFindService.getUserCredit(
      req.user.userId,
    );
    //* 필요한 데이터 형태를 미리 만들어둡니다.
    //* 현재 시간
    const currentTime = getCurrentISOTime();
    //* 리서치 생성에 필요한 크레딧
    //TODO: ExtraCredit 에 따른 credit 도 반영해야 함
    const requiredCredit = CREDIT_PER_MINUTE * body.estimatedTime;
    //* 새로운 리서치 정보
    const research: Research = {
      ...body,
      authorId: req.user.userId,
      credit: CREDIT_PER_MINUTE * body.estimatedTime,
      pulledupAt: currentTime,
      createdAt: currentTime,
    };
    //* CreditHistory 정보
    const creditHistory: CreditHistory = {
      userId: req.user.userId,
      reason: body.title,
      type: "리서치 작성",
      scale: -1 * requiredCredit,
      balance: userCredit + -1 * requiredCredit,
      createdAt: currentTime,
    };

    //* User DB, Research DB 세션을 시작합니다.
    const startUserSession = this.userConnection.startSession();
    const startResearchSession = this.researchConnection.startSession();

    const { userSession, researchSession } = await Promise.all([
      startUserSession,
      startResearchSession,
    ]).then(([userSession, researchSession]) => {
      return { userSession, researchSession };
    });

    return await tryMultiTransaction(async () => {
      //TODO: Promise.all 로 처리
      //* 먼저 리서치를 만듭니다
      const newResearch = await this.mongoResearchCreateService.createResearch(
        { research, files: {} },
        researchSession,
      );

      //* 만들어진 리서치 정보와
      //* 미리 작성한 CreditHistory 정보를 User DB 에 반영합니다.
      const newCreditHistory = await this.userUpdateService.uploadResearch(
        {
          userId: req.user.userId,
          researchId: newResearch._id,
          creditHistory,
        },
        userSession,
      );

      return { newResearch, newCreditHistory };
    }, [userSession, researchSession]);
  }

  /**
   * ! 배포 전에 이미지 없이 로드하는 방식과 로직 똑같은지 반드시 확인
   * 이미지 파일이 포함된 새로운 리서치를 생성합니다.
   * (로직은 createResearch와 동일합니다)
   * 이미지는 S3 버킷에 업로드됩니다.
   * @return 생성된 리서치, CreditHistory 정보
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
    @Body() body: ResearchCreateBodyDto,
    @UploadedFiles()
    files: {
      thumbnail?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
  ) {
    //* 유저가 가진 credit 을 가져옵니다
    const userCredit = await this.mongoUserFindService.getUserCredit(
      req.user.userId,
    );
    //* 필요한 데이터 형태를 미리 만들어둡니다.
    const currentTime = getCurrentISOTime();
    const requiredCredit = CREDIT_PER_MINUTE * body.estimatedTime;
    //* 새로운 리서치 정보
    const research: Research = {
      ...body,
      authorId: req.user.userId,
      credit: CREDIT_PER_MINUTE * body.estimatedTime,
      pulledupAt: currentTime,
      createdAt: currentTime,
    };
    //* CreditHistory 정보
    //TODO: ExtraCredit 에 따른 credit 도 반영해야 함
    const creditHistory: CreditHistory = {
      userId: req.user.userId,
      reason: body.title,
      type: "리서치 작성",
      scale: -1 * requiredCredit,
      balance: userCredit + -1 * requiredCredit,
      createdAt: currentTime,
    };

    //* User DB, Research DB 세션을 시작합니다.
    const userSession = await this.userConnection.startSession();
    const researchSession = await this.researchConnection.startSession();

    return await tryMultiTransaction(async () => {
      const newResearch = await this.mongoResearchCreateService.createResearch(
        { research, files },
        researchSession,
      );

      const newCreditHistory = await this.userUpdateService.uploadResearch(
        {
          userId: req.user.userId,
          researchId: newResearch._id,
          creditHistory,
        },
        userSession,
      );

      return { newResearch, newCreditHistory };
    }, [userSession, researchSession]);
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
    const comment = {
      researchId: body.researchId,
      authorId: req.user.userId,
      content: body.content,
    };

    const researchSession = await this.researchConnection.startSession();

    return await tryMultiTransaction(async () => {
      const { updatedResearch, newComment } =
        await this.mongoResearchCreateService.createResearchComment(
          { comment },
          researchSession,
        );

      return { updatedResearch, newComment };
    }, [researchSession]);
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
    const reply = {
      researchId: body.researchId,
      commentId: body.commentId,
      authorId: req.user.userId,
      content: body.content,
    };

    const researchSession = await this.researchConnection.startSession();

    return await tryMultiTransaction(async () => {
      const { updatedReserach, newReply } =
        await this.mongoResearchCreateService.createResearchReply(
          { reply },
          researchSession,
        );

      return { updatedReserach, newReply };
    }, [researchSession]);
  }

  /**
   * 리서치를 신고합니다.
   * @author 현웅
   */
  @Post("report")
  async reportResearch(
    @Request() req: { user: JwtUserInfo },
    @Body() body: ResearchReportBodyDto,
  ) {
    return await this.mongoResearchCreateService.createResearchReport({
      userId: req.user.userId,
      userNickname: req.user.userNickname,
      researchId: body.researchId,
      content: body.content,
    });
  }

  // /**
  //  * 더미 리서치를 생성합니다.
  //  * @author 현웅
  //  */
  // @Post("dummy")
  // async createDummyResearches(@Request() req: { user: JwtUserInfo }) {
  //   const dummyResearches = getDummyResearches({
  //     authorId: req.user.userId,
  //     num: 56,
  //   });

  //   for (const dummyResearch of dummyResearches) {
  //     const userCredit = await this.mongoUserFindService.getUserCredit(
  //       req.user.userId,
  //     );
  //     const requiredCredit = CREDIT_PER_MINUTE * dummyResearch.estimatedTime;
  //     const currentTime = getCurrentISOTime();

  //     const research: Research = {
  //       ...dummyResearch,
  //       createdAt: currentTime,
  //       pulledupAt: currentTime,
  //     };

  //     const creditHistory: CreditHistory = {
  //       reason: dummyResearch.title,
  //       type: "리서치 작성",
  //       scale: -1 * requiredCredit,
  //       balance: userCredit + -1 * requiredCredit,
  //       createdAt: currentTime,
  //     };

  //     const newResearch = await this.mongoResearchCreateService.createResearch({
  //       research,
  //       files: {},
  //     });

  //     await this.userUpdateService.uploadResearch({
  //       userId: req.user.userId,
  //       creditHistory,
  //       researchId: newResearch._id,
  //     });
  //   }

  //   return;
  // }
}
