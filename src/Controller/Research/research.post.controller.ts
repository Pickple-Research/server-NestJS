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
import { ResearchUpdateService } from "src/Service";
import {
  Research,
  ResearchComment,
  ResearchReply,
  ResearchCommentReport,
  CreditHistory,
} from "src/Schema";
import {
  MongoUserFindService,
  MongoUserCreateService,
  MongoResearchFindService,
  MongoResearchCreateService,
} from "src/Mongo";
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
  ResearchCommentReportBodyDto,
  ResearchReplyReportBodyDto,
  ResearchMypageBodyDto,
} from "src/Dto";
import { JwtUserInfo } from "src/Object/Type";
import { CreditHistoryType } from "src/Object/Enum";
import {
  CREDIT_PER_MINUTE,
  MONGODB_USER_CONNECTION,
  MONGODB_RESEARCH_CONNECTION,
} from "src/Constant";
import { NotEnoughCreditException } from "src/Exception";
// import { getDummyResearches } from "src/Dummy";

@Controller("researches")
export class ResearchPostController {
  constructor(
    private readonly researchUpdateService: ResearchUpdateService,

    @InjectConnection(MONGODB_USER_CONNECTION)
    private readonly userConnection: Connection,
    @InjectConnection(MONGODB_RESEARCH_CONNECTION)
    private readonly researchConnection: Connection,
  ) {}

  @Inject()
  private readonly mongoUserFindService: MongoUserFindService;
  @Inject()
  private readonly mongoUserCreateService: MongoUserCreateService;
  @Inject()
  private readonly mongoResearchFindService: MongoResearchFindService;
  @Inject()
  private readonly mongoResearchCreateService: MongoResearchCreateService;

  /**
   * 이미지가 포함되지 않은 새로운 리서치를 생성합니다.
   * @return 생성된 리서치, CreditHistory 정보
   * @author 현웅
   */
  @Post("")
  async createResearchWithoutImages(
    @Request() req: { user: JwtUserInfo },
    @Body() body: ResearchCreateBodyDto,
  ) {
    return await this.createResearch({
      userId: req.user.userId,
      body,
      files: {},
    });
  }

  /**
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
    return await this.createResearch({
      userId: req.user.userId,
      body,
      files,
    });
  }

  /**
   * 리서치를 업로드합니다.
   * 이미지가 포함된 경우, 포함되지 않은 경우 모두를 포괄합니다.
   * @author 현웅
   */
  async createResearch(param: {
    userId: string;
    body: ResearchCreateBodyDto;
    files: {
      thumbnail?: Express.Multer.File[];
      images?: Express.Multer.File[];
    };
  }) {
    //* 유저가 가진 credit 을 가져옵니다
    const user = await this.mongoUserFindService.getUser({
      userId: param.userId,
      selectQuery: { credit: true },
    });
    //* 필요한 데이터 형태를 미리 만들어둡니다.
    //* 리서치 생성에 필요한 크레딧
    const requiredCredit =
      //* 소요시간에 필요한 크레딧
      CREDIT_PER_MINUTE(param.body.estimatedTime) +
      //* 추가 리서치 지급에 필요한 크레딧
      param.body.extraCredit * param.body.extraCreditReceiverNum +
      //* 연령 스크리닝에 필요한 크레딧
      (param.body.targetAgeGroups.length !== 0 ? 5 : 0);

    //* 이 때, 유저의 크레딧이 충분한지 확인하고 충분하지 않으면 에러를 일으킵니다.
    if (user.credit < requiredCredit) throw new NotEnoughCreditException();

    //* 현재 시간
    const currentTime = getCurrentISOTime();
    //* 새로운 리서치 정보
    const research: Research = {
      ...param.body,
      authorId: param.userId,
      credit: CREDIT_PER_MINUTE(param.body.estimatedTime),
      pulledupAt: currentTime,
      createdAt: currentTime,
    };
    //* CreditHistory 정보
    const creditHistory: CreditHistory = {
      userId: param.userId,
      reason: param.body.title,
      type: CreditHistoryType.RESEARCH_UPLOAD,
      scale: -1 * requiredCredit,
      isIncome: false,
      balance: user.credit + -1 * requiredCredit,
      createdAt: currentTime,
    };

    //* User DB, Research DB 세션을 시작합니다.
    const userSession = await this.userConnection.startSession();
    const researchSession = await this.researchConnection.startSession();

    return await tryMultiTransaction(async () => {
      //* 리서치 데이터를 만듭니다
      const createNewResearch = this.mongoResearchCreateService.createResearch(
        { research, files: param.files },
        researchSession,
      );

      //* CreditHistory 정보를 User DB 에 반영합니다.
      const createNewCreditHistory =
        this.mongoUserCreateService.createCreditHistory(
          { userId: param.userId, creditHistory },
          userSession,
        );

      const { newResearch, newCreditHistory } = await Promise.all([
        createNewResearch,
        createNewCreditHistory,
      ]).then(([newResearch, newCreditHistory]) => {
        return { newResearch, newCreditHistory };
      });

      //TODO: 서버에서 같은 Container 를 두 개 돌리고 있기 때문에, 해당 부분이 처리되기 전까지는 일단 구동되지 않게 합니다.
      // //* 이 때, 리서치에 마감일이 설정되어 있는 경우
      // //* ScheduleRegistry 에 리서치 자동 마감 CronJob 을 등록합니다.
      // if (Boolean(newResearch.deadline)) {
      //   this.researchUpdateService.addResearchAutoCloseCronJob({
      //     researchId: newResearch._id,
      //     deadline: newResearch.deadline,
      //   });
      // }

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
    const comment: ResearchComment = {
      researchId: body.researchId,
      authorId: req.user.userId,
      content: body.content,
      createdAt: getCurrentISOTime(),
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
    const reply: ResearchReply = {
      researchId: body.researchId,
      commentId: body.commentId,
      authorId: req.user.userId,
      content: body.content,
      createdAt: getCurrentISOTime(),
    };

    const researchSession = await this.researchConnection.startSession();

    return await tryMultiTransaction(async () => {
      const { updatedResearch, newReply } =
        await this.mongoResearchCreateService.createResearchReply(
          { reply },
          researchSession,
        );

      return { updatedResearch, newReply };
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

  /**
   * 리서치 댓글을 신고합니다.
   * @author 현웅
   */
  @Post("report/comments")
  async reportResearchComment(
    @Request() req: { user: JwtUserInfo },
    @Body() body: ResearchCommentReportBodyDto,
  ) {
    const researchCommentReport: ResearchCommentReport = {
      userId: req.user.userId,
      userNickname: req.user.userNickname,
      comment: body.comment,
      content: body.content,
      createdAt: getCurrentISOTime(),
    };
    return await this.mongoResearchCreateService.createResearchCommentReport({
      researchCommentReport,
    });
  }

  /**
   * 리서치 대댓글을 신고합니다.
   * @author 현웅
   */
  @Post("report/replies")
  async reportResearchReply(
    @Request() req: { user: JwtUserInfo },
    @Body() body: ResearchReplyReportBodyDto,
  ) {
    const researchCommentReport: ResearchCommentReport = {
      userId: req.user.userId,
      userNickname: req.user.userNickname,
      reply: body.reply,
      content: body.content,
      createdAt: getCurrentISOTime(),
    };
    return await this.mongoResearchCreateService.createResearchCommentReport({
      researchCommentReport,
    });
  }

  /**
   * TODO: get 요청으로 처리하고 싶긴 한데...
   * 마이페이지 - 스크랩/참여한 리서치 목록을 더 가져옵니다.
   * @author 현웅
   */
  @Post("mypage")
  async getMypageResearches(@Body() body: ResearchMypageBodyDto) {
    return await this.mongoResearchFindService.getResearchesById(
      body.researchIds,
    );
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

  //   const researchSession = await this.researchConnection.startSession();

  //   return await tryMultiTransaction(async () => {
  //     for (const dummyResearch of dummyResearches) {
  //       const user = await this.mongoUserFindService.getUser({
  //         userId: req.user.userId,
  //         selectQuery: { credit: true },
  //       });
  //       const userCredit = user.credit;
  //       const requiredCredit = CREDIT_PER_MINUTE(dummyResearch.estimatedTime);
  //       const currentTime = getCurrentISOTime();

  //       const research: Research = {
  //         ...dummyResearch,
  //         createdAt: currentTime,
  //         pulledupAt: currentTime,
  //       };

  //       const creditHistory: CreditHistory = {
  //         userId: req.user.userId,
  //         reason: dummyResearch.title,
  //         type: "리서치 작성",
  //         scale: -1 * requiredCredit,
  //         balance: userCredit + -1 * requiredCredit,
  //         isIncome: false,
  //         createdAt: currentTime,
  //       };

  //       await this.mongoResearchCreateService.createResearch(
  //         {
  //           research,
  //           files: {},
  //         },
  //         researchSession,
  //       );

  //       await this.mongoUserCreateService.createCreditHistory(
  //         {
  //           userId: req.user.userId,
  //           creditHistory,
  //         },
  //         researchSession,
  //       );
  //     }
  //   }, [researchSession]);
  // }
}
