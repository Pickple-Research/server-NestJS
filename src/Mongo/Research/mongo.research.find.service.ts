import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  Research,
  ResearchDocument,
  ResearchComment,
  ResearchCommentDocument,
  ResearchParticipation,
  ResearchParticipationDocument,
  ResearchReply,
  ResearchReplyDocument,
  ResearchUser,
  ResearchUserDocument,
} from "src/Schema";
import {
  NotResearchAuthorException,
  ResearchNotFoundException,
} from "src/Exception";

@Injectable()
export class MongoResearchFindService {
  constructor(
    @InjectModel(Research.name)
    private readonly Research: Model<ResearchDocument>,
    @InjectModel(ResearchComment.name)
    private readonly ResearchComment: Model<ResearchCommentDocument>,
    @InjectModel(ResearchParticipation.name)
    private readonly ResearchParticipation: Model<ResearchParticipationDocument>,
    @InjectModel(ResearchReply.name)
    private readonly ResearchReply: Model<ResearchReplyDocument>,
    @InjectModel(ResearchUser.name)
    private readonly ResearchUser: Model<ResearchUserDocument>,
  ) {}

  /**
   * 인자로 받은 유저 _id 가 리서치 작성자 _id 와 일치하는지 확인합니다.
   * 일치하지 않는 경우, 에러를 발생시킵니다.
   * @author 현웅
   */
  async isResearchAuthor(param: { userId: string; researchId: string }) {
    const research = await this.Research.findById(param.researchId)
      .select({ authorId: 1 })
      .lean();
    if (research.authorId !== param.userId) {
      throw new NotResearchAuthorException();
    }
    return;
  }

  /**
   * 리서치 참여시 제공 크레딧을 반환합니다.
   * @author 현웅
   */
  async getResearchCredit(researchId: string) {
    const research = await this.Research.findById(researchId)
      .select({ credit: 1 })
      .lean();
    return research.credit;
  }

  /**
   * 최신 리서치를 원하는만큼 찾고 반환합니다.
   * @author 현웅
   */
  async getRecentResearches(get: number = 20) {
    return await this.Research.find()
      .sort({ pulledupAt: -1 }) // 최신순 정렬 후
      .limit(get) // 원하는 수만큼
      .populate({
        path: "author",
        model: this.ResearchUser,
      })
      // .select({})  //TODO: 원하는 property만
      .lean(); // data만 뽑아서 반환
  }

  /**
   * 주어진 리서치 pulledupAt을 기준으로 하여 더 최근의 리서치를 모두 찾고 반환합니다.
   * @author 현웅
   */
  async getNewerResearches(pulledupAt: string) {
    return await this.Research.find({
      hidden: false, // 숨겼거나
      blocked: false, // 차단되지 않은 리서치 중
      pulledupAt: { $gt: pulledupAt }, // 주어진 pulledupAt 시기보다 더 나중에 끌올된 리서치 중에서
    })
      .sort({ pulledupAt: -1 }) // 최신순 정렬 후
      .populate({
        path: "author",
        model: this.ResearchUser,
      })
      .lean(); // data만 뽑아서 반환
  }

  /**
   * 주어진 리서치 pulledupAt을 기준으로 하여 과거의 리서치 10개를 찾고 반환합니다.
   * @author 현웅
   */
  async getOlderResearches(pulledupAt: string, limit: number = 10) {
    return await this.Research.find({
      hidden: false, // 숨겼거나
      blocked: false, // 차단되지 않은 리서치 중
      pulledupAt: { $lt: pulledupAt }, // 주어진 pulledupAt 시기보다 먼저 끌올된 리서치 중에서
    })
      .sort({ pulledupAt: -1 }) // 최신순 정렬 후
      .limit(limit) // 10개를 가져오고
      .populate({
        path: "author",
        model: this.ResearchUser,
      })
      .lean(); // data만 뽑아서 반환
  }

  /**
   * 주어진 _id를 통해 리서치를 찾고 반환합니다.
   * @author 현웅
   */
  async getResearchById(researchId: string, handleAsException?: boolean) {
    return await this.Research.findById(researchId)
      .populate({
        path: "author",
        model: this.ResearchUser,
      })
      .lean();
  }

  /**
   * 리서치 댓글을 모두 가져옵니다.
   * @author 현웅
   */
  async getResearchComments(researchId: string) {
    return await this.ResearchParticipation.findById(researchId)
      .select({ comments: 1 })
      .populate({
        path: "comments",
        model: this.ResearchComment,
        populate: [
          {
            path: "author",
            model: this.ResearchUser,
          },
          {
            path: "replies",
            model: this.ResearchReply,
            populate: {
              path: "author",
              model: this.ResearchUser,
            },
          },
        ],
      })
      .lean();
  }
}
