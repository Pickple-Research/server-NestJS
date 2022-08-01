import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ClientSession } from "mongoose";
import {
  Vote,
  VoteDocument,
  VoteComment,
  VoteCommentDocument,
  VoteParticipation,
  VoteParticipationDocument,
  VoteReply,
  VoteReplyDocument,
  VoteScrap,
  VoteScrapDocument,
  VoteUser,
  VoteUserDocument,
} from "src/Schema";

@Injectable()
export class MongoVoteDeleteService {
  constructor(
    @InjectModel(Vote.name) private readonly Vote: Model<VoteDocument>,
    @InjectModel(VoteComment.name)
    private readonly VoteComment: Model<VoteCommentDocument>,
    @InjectModel(VoteParticipation.name)
    private readonly VoteParticipation: Model<VoteParticipationDocument>,
    @InjectModel(VoteReply.name)
    private readonly VoteReply: Model<VoteReplyDocument>,
    @InjectModel(VoteScrap.name)
    private readonly VoteScrap: Model<VoteScrapDocument>,
    @InjectModel(VoteUser.name)
    private readonly VoteUser: Model<VoteUserDocument>,
  ) {}

  /**
   * @Transaction
   * 유저 탈퇴시, VoteUser 정보를 함께 삭제합니다.
   * @author 현웅
   */
  async deleteVoteUser(param: { userId: string }, session: ClientSession) {
    await this.VoteUser.findByIdAndUpdate(
      param.userId,
      { $set: { deleted: true } },
      { session },
    );
    return;
  }

  /**
   * @Transaction
   * 투표를 삭제합니다.
   * @author 현웅
   */
  async deleteVoteById(param: { voteId: string }, session: ClientSession) {
    //* 투표 삭제
    await this.Vote.findByIdAndDelete(param.voteId, { session });
    //* 투표 참여 정보 삭제
    await this.VoteParticipation.deleteMany(
      { voteId: param.voteId },
      { session },
    );
    //* 투표 스크랩 정보 삭제
    await this.VoteScrap.deleteMany({ voteId: param.voteId }, { session });
    //* 댓글과 대댓글 모두 삭제
    await this.VoteComment.deleteMany({ voteId: param.voteId }, { session });
    await this.VoteReply.deleteMany({ voteId: param.voteId }, { session });
    return;
  }

  /**
   * 투표 스크랩 취소시: 투표 스크랩 정보를 삭제합니다.
   * @author 현웅
   */
  async deleteVoteScrap(param: { userId: string; voteId: string }) {
    return await this.VoteScrap.findOneAndDelete({
      userId: param.userId,
      voteId: param.voteId,
    });
  }
}
