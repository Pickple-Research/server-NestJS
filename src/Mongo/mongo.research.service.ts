import { Injectable } from "@nestjs/common";
import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { Model, Connection } from "mongoose";
import { AwsS3Service } from "../AWS";
import { ResearchCreateDto } from "../Dto";
import { S3UploadingObject } from "../Object/Type";
import {
  getCurrentISOTime,
  tryTransaction,
  getS3UploadingObject,
} from "../Util";
import { Research, ResearchDocument } from "../Schema";
import { MONGODB_RESEARCH_CONNECTION, BUCKET_NAME } from "../Constant";

@Injectable()
export class MongoResearchService {
  constructor(
    @InjectModel(Research.name)
    private readonly Research: Model<ResearchDocument>,
    private readonly awsS3Service: AwsS3Service,
    @InjectConnection(MONGODB_RESEARCH_CONNECTION)
    private readonly connection: Connection,
  ) {}

  /**
   * 최신 리서치를 원하는만큼 찾고 반환합니다.
   * @author 현웅
   */
  async getRecentResearches(get: number) {
    return await this.Research.find()
      .sort({ _id: -1 }) // 최신순 정렬 후 (mongodb의 _id가 생성일자 정보를 포함하기에 가능한 방식)
      .limit(get) // 원하는 수만큼
      // .select({})  //TODO: 원하는 property만
      .lean(); // data만 뽑아서 반환
  }

  /**
   * 주어진 리서치 _id를 기준으로 하여 과거의 리서치 10개를 찾고 반환합니다.
   * TODO: 검증해볼 것
   * @author 현웅
   */
  async getPaginatedResearches(researchId: string) {
    return await this.Research.find({
      _id: { $gt: researchId }, // 주어진 research의 _id 보다 과거의 _id를 가진 research 중에서
    })
      .sort({ _id: -1 }) // 최신순 정렬 후
      .limit(10) // 10개를 가져오고
      .lean(); // data만 뽑아서 반환
  }

  /**
   * 주어진 _id를 통해 리서치를 찾고 반환합니다.
   * @author 현웅
   */
  async getResearchById(researchId: string) {
    return await this.Research.findOne({ _id: researchId }).lean();
  }

  /**
   * (Transaction)
   * 새로운 리서치를 생성합니다. 인자로 주어진 파일이 있는 경우, S3 업로드를 시도합니다.
   * (파일 업로드가 실패하면 리서치 생성도 무효화됩니다)
   * @author 현웅
   */
  async createResearch(researchCreateDto: ResearchCreateDto) {
    const session = await this.connection.startSession();

    //* Transaction을 이용해 진행합니다.
    return await tryTransaction(session, async () => {
      //* 먼저 리서치를 만들어둡니다. 이 행위는 session에 종속됩니다.
      await this.Research.create(
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

      return;
    });
  }
}
