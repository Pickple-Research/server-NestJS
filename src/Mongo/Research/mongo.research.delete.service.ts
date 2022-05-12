import { Injectable } from "@nestjs/common";
import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { Model, Connection } from "mongoose";
import { AwsS3Service } from "src/AWS";
import {
  Research,
  ResearchDocument,
  ResearchComment,
  ResearchCommentDocument,
  ResearchParticipation,
  ResearchParticipationDocument,
} from "src/Schema";
import { MONGODB_RESEARCH_CONNECTION, BUCKET_NAME } from "src/Constant";
import { tryTransaction } from "src/Util";

@Injectable()
export class MongoResearchDeleteService {
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
   * 리서치를 삭제합니다.
   * @author 현웅
   */
  //TODO: AWS S3 오브젝트도 함께 지워야 합니다.
  async deleteResearch(researchId: string) {
    const session = await this.connection.startSession();

    return await tryTransaction(session, async () => {
      //* 리서치 기본 데이터는 삭제하지 않고 남겨둡니다.
      await this.Research.findByIdAndUpdate(
        researchId,
        { $set: { deleted: true } },
        { session },
      );
      //TODO: Comment는 추후 변경
      await this.ResearchComment.findByIdAndDelete(researchId, { session });
      await this.ResearchParticipation.findByIdAndDelete(researchId, {
        session,
      });
      return;
    });
  }
}
