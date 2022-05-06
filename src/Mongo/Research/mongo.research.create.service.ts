import { Injectable } from "@nestjs/common";
import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { Model, Connection } from "mongoose";
import { AwsS3Service } from "../../AWS";
import { ResearchCreateDto } from "../../Dto";
import { S3UploadingObject } from "../../Object/Type";
import {
  getCurrentISOTime,
  tryTransaction,
  getS3UploadingObject,
} from "../../Util";
import {
  Research,
  ResearchDocument,
  ResearchComment,
  ResearchCommentDocument,
  ResearchParticipation,
  ResearchParticipationDocument,
} from "../../Schema";
import { MONGODB_RESEARCH_CONNECTION, BUCKET_NAME } from "../../Constant";

@Injectable()
export class MongoResearchCreateService {
  constructor(
    @InjectModel(Research.name)
    private readonly Research: Model<ResearchDocument>,
    @InjectModel(ResearchComment.name)
    private readonly ResearchComment: Model<ResearchCommentDocument>,
    @InjectModel(ResearchParticipation.name)
    private readonly ResearchParticipation: Model<ResearchParticipationDocument>,

    private readonly awsS3Service: AwsS3Service,

    @InjectConnection(MONGODB_RESEARCH_CONNECTION)
    private readonly connection: Connection,
  ) {}

  /**
   * @Transaction
   * 새로운 리서치를 생성합니다. 인자로 주어진 파일이 있는 경우, S3 업로드를 시도합니다.
   * (파일 업로드가 실패하면 리서치 생성도 무효화됩니다)
   * @author 현웅
   */
  async createResearch(researchCreateDto: ResearchCreateDto) {
    const session = await this.connection.startSession();

    //* Transaction을 이용해 진행합니다.
    return await tryTransaction(session, async () => {
      //* 먼저 리서치를 만들어둡니다. 이 행위는 session에 종속됩니다.
      const newResearch = await this.Research.create(
        [
          {
            ...researchCreateDto,
            createdAt: getCurrentISOTime(),
          },
        ],
        { session },
      );

      //* 첨부된 파일들을 S3 버킷에 올릴 수 있는 형태로 변환한 후 배열에 저장합니다.
      const uploadingObjects: S3UploadingObject[] = [];

      researchCreateDto.files?.thumbnail?.forEach((thumbnail) => {
        uploadingObjects.push(
          getS3UploadingObject(BUCKET_NAME.RESEARCH, thumbnail, `thumbnail`),
        );
      });

      researchCreateDto.files?.images?.forEach((image, index) => {
        uploadingObjects.push(
          getS3UploadingObject(BUCKET_NAME.RESEARCH, image, `image${index}`),
        );
      });

      //* 첨부된 파일이 있다면, S3에 병렬적으로 업로드 해줍니다.
      //* (Promise.all()과 S3 버킷에 올릴 객체 배열의 map()을 이용합니다)
      //* 이 과정이 실패하면 위에서 만든 리서치도 무효화됩니다.
      if (uploadingObjects.length) {
        await Promise.all(
          uploadingObjects.map((object) => {
            return this.awsS3Service.uploadObject(object);
          }),
        );
      }

      //TODO: #QUERY-EFFICIENCY #CREATE/DELETE-MANY (해당 해쉬태그로 모두 찾아서 바꿀 것)
      const newResearchId = newResearch[0]._id;
      await this.ResearchComment.create([{ _id: newResearchId }], { session });
      await this.ResearchParticipation.create([{ _id: newResearchId }], {
        session,
      });

      return;
    });
  }
}
