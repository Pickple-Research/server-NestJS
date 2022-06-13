import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ClientSession } from "mongoose";
import { AwsS3Service } from "src/AWS";
import { S3UploadingObject } from "src/Object/Type";
import {
  getCurrentISOTime,
  getISOTimeAfterGivenDays,
  getS3UploadingObject,
} from "src/Util";
import {
  Research,
  ResearchDocument,
  ResearchComment,
  ResearchCommentDocument,
  ResearchParticipation,
  ResearchParticipationDocument,
  ResearchReply,
  ResearchReplyDocument,
} from "src/Schema";
import { BUCKET_NAME } from "src/Constant";

@Injectable()
export class MongoResearchCreateService {
  constructor(
    @InjectModel(Research.name)
    private readonly Research: Model<ResearchDocument>,
    @InjectModel(ResearchComment.name)
    private readonly ResearchComment: Model<ResearchCommentDocument>,
    @InjectModel(ResearchParticipation.name)
    private readonly ResearchParticipation: Model<ResearchParticipationDocument>,
    @InjectModel(ResearchReply.name)
    private readonly ResearchReply: Model<ResearchReplyDocument>,

    private readonly awsS3Service: AwsS3Service,
  ) {}

  /**
   * @Transaction
   * 새로운 리서치를 생성합니다. 인자로 주어진 파일이 있는 경우, S3 업로드를 시도합니다.
   * (파일 업로드가 실패하면 리서치 생성도 무효화됩니다)
   *
   * @param authorId 리서치 업로더 _id
   * @param research 리서치 정보
   * @param files 리서치와 같이 업로드할 파일
   * @param session
   *
   * @return 생성된 리서치 정보
   * @author 현웅
   */
  //TODO: files 타입 잡아줘야함
  async createResearch(
    authorId: string,
    research: Partial<Research>,
    files: {
      // thumbnail?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
    session: ClientSession,
  ) {
    //* 인자로 주어진 Session을 이용해 진행합니다.

    //* 먼저 주어진 리서치 정보에 누락된 필수정보인
    //* 리서치 진행자 _id와 생성 시간과 마감일자를 추가하여 리서치를 만들어둡니다.
    //* 이 행위는 session에 종속됩니다.
    const newResearches = await this.Research.create(
      [
        {
          ...research,
          authorId,
          createdAt: getCurrentISOTime(),
          deadline: getISOTimeAfterGivenDays(3),
        },
      ],
      { session },
    );

    //TODO: #QUERY-EFFICIENCY #CREATE/DELETE-MANY (해당 해쉬태그로 모두 찾아서 바꿀 것)
    const newResearch = newResearches[0];
    await this.ResearchParticipation.create([{ _id: newResearch._id }], {
      session,
    });

    //* 첨부된 파일들을 S3 버킷에 올릴 수 있는 형태로 변환한 후 배열에 저장합니다.
    const uploadingObjects: S3UploadingObject[] = [];

    // files.thumbnail?.forEach((thumbnail) => {
    //   uploadingObjects.push(
    //     getS3UploadingObject(BUCKET_NAME.RESEARCH, thumbnail, `thumbnail`),
    //   );
    // });

    files.images?.forEach((image, index) => {
      uploadingObjects.push(
        getS3UploadingObject(BUCKET_NAME.RESEARCH, image, `image${index}`),
      );
    });

    //* 첨부된 파일이 있다면, S3에 병렬적으로 업로드 해줍니다.
    //* (Promise.all()과 S3 버킷에 올릴 객체 배열의 map()을 이용합니다)
    //* 이 과정이 하나라도 실패하면 위에서 만든 리서치도 무효화됩니다.
    if (uploadingObjects.length) {
      await Promise.all(
        uploadingObjects.map((object) => {
          return this.awsS3Service.uploadObject(object);
        }),
      );
    }

    return newResearch;
  }

  /**
   * @Transaction
   * 리서치 댓글을 작성합니다.
   * @return 생성된 리서치 댓글
   * @author 현웅
   */
  async createResearchComment(
    researchComment: ResearchComment,
    session?: ClientSession,
  ) {
    await this.Research.findByIdAndUpdate(
      researchComment.researchId,
      { $inc: { commentsNum: 1 } },
      { session },
    );
    const newComments = await this.ResearchComment.create(
      [{ ...researchComment, createdAt: getCurrentISOTime() }],
      { session },
    );
    await this.ResearchParticipation.findByIdAndUpdate(
      researchComment.researchId,
      { $push: { commentIds: newComments[0]._id } },
      { session },
    );
    return newComments[0];
  }

  /**
   * @Transaction
   * 리서치 대댓글을 작성합니다.
   * @return 생성된 리서치 대댓글
   * @author 현웅
   */
  async createResearchReply(
    researchReply: ResearchReply,
    session?: ClientSession,
  ) {
    await this.Research.findByIdAndUpdate(
      researchReply.researchId,
      { $inc: { commentsNum: 1 } },
      { session },
    );
    const newReplies = await this.ResearchReply.create(
      [{ ...researchReply, createdAt: getCurrentISOTime() }],
      { session },
    );
    await this.ResearchComment.findByIdAndUpdate(
      researchReply.commentId,
      { $push: { replyIds: newReplies[0]._id } },
      { session },
    );
    return newReplies[0];
  }
}
