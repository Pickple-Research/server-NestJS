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
  ResearchMypageBodyDto,
} from "src/Dto";
import { JwtUserInfo } from "src/Object/Type";
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
  async createResearch(
    @Request() req: { user: JwtUserInfo },
    @Body() body: ResearchCreateBodyDto,
  ) {
    //* 유저가 가진 credit 을 가져옵니다
    const userCredit = await this.mongoUserFindService.getUserCredit(
      req.user.userId,
    );
    //* 필요한 데이터 형태를 미리 만들어둡니다.
    //* 리서치 생성에 필요한 크레딧
    const requiredCredit =
      //* 소요시간에 필요한 크레딧
      CREDIT_PER_MINUTE * body.estimatedTime +
      //* 추가 리서치 지급에 필요한 크레딧
      body.extraCredit * body.extraCreditRecieverNum +
      //* 연령 스크리닝에 필요한 크레딧
      (body.targetAgeGroups.length !== 0 ? 5 : 0);

    //* 이 때, 유저의 크레딧이 충분한지 확인하고 충분하지 않으면 에러를 일으킵니다.
    if (userCredit < requiredCredit) throw new NotEnoughCreditException();

    //* 현재 시간
    const currentTime = getCurrentISOTime();
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
    const userSession = await this.userConnection.startSession();
    const researchSession = await this.researchConnection.startSession();

    return await tryMultiTransaction(async () => {
      //TODO: Promise.all 로 처리
      //* 리서치/리서치 참여 현황 데이터를 만듭니다
      const createNewResearch = this.mongoResearchCreateService.createResearch(
        { research, files: {} },
        researchSession,
      );

      //* CreditHistory 정보를 User DB 에 반영합니다.
      const createNewCreditHistory =
        this.mongoUserCreateService.createCreditHistory(
          { userId: req.user.userId, creditHistory },
          userSession,
        );

      return await Promise.all([
        createNewResearch,
        createNewCreditHistory,
      ]).then(([newResearch, newCreditHistory]) => {
        return { newResearch, newCreditHistory };
      });
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
    const requiredCredit = CREDIT_PER_MINUTE * body.estimatedTime;

    //* 이 때, 유저의 크레딧이 충분한지 확인하고 충분하지 않으면 에러를 일으킵니다.
    if (userCredit < requiredCredit) throw new NotEnoughCreditException();

    const currentTime = getCurrentISOTime();
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

      //* CreditHistory 정보를 User DB 에 반영합니다.
      const newCreditHistory =
        await this.mongoUserCreateService.createCreditHistory(
          { userId: req.user.userId, creditHistory },
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

  /**
   * TODO: get 요청으로 처리하고 싶긴 한데...
   * 마이페이지 - 스크랩/참여한 리서치 목록을 더 가져옵니다.
   * @author 현웅
   */
  @Post("mypage")
  async getMypageResearches(@Body() body: ResearchMypageBodyDto) {
    return await this.mongoResearchFindService.getResearches(body.researchIds);
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
  //       userId: req.user.userId,
  //       reason: dummyResearch.title,
  //       type: "리서치 작성",
  //       scale: -1 * requiredCredit,
  //       balance: userCredit + -1 * requiredCredit,
  //       createdAt: currentTime,
  //     };

  //     await this.mongoResearchCreateService.createResearch({
  //       research,
  //       files: {},
  //     });

  //     await this.mongoUserCreateService.createCreditHistory({
  //       userId: req.user.userId,
  //       creditHistory,
  //     });
  //   }

  //   return;
  // }
}
