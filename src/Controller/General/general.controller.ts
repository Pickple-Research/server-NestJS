import {
  Headers,
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
} from "@nestjs/common";
import { GeneralService } from "../../Service";

@Controller("votes")
export class GeneralController {
  constructor(private readonly generalService: GeneralService) {}

  // Get Requests
  // 전체 투표 반환
  @Get("")
  async getAllGeneral() {
    return await this.generalService.getAllGeneral();
  }

  // 무한 스크롤 투표 반환
  @Get("scroll/:page")
  async getGeneralByScroll() {
    return await this.generalService.getGeneralByScroll();
  }

  // 특정 투표 반환
  @Get("general-id/:general_id")
  async getCertainGeneralById() {
    return await this.generalService.getCertainGeneralById();
  }

  // 랜덤 투표 반환
  @Get("random/:number")
  async getRandomGeneral() {
    return await this.generalService.getRandomGeneral();
  }

  // Post Requests
  // 투표 생성
  @Post("")
  async createGeneral() {
    return await this.generalService.createGeneral();
  }

  // 댓글 생성
  @Post("comment")
  async createGeneralComment() {
    return await this.generalService.createGeneralComment();
  }

  // 대댓글 생성
  @Post("reply")
  async createGeneralCommentReply() {
    return await this.generalService.createGeneralCommentReply();
  }

  // Put Requests
  // 투표 참여
  @Put("participate")
  async participateGeneral(@Body() body) {
    return await this.generalService.participateGeneral();
  }

  // 투표 좋아요 토글
  @Put("like")
  async toggleGeneralLike(@Body() body) {
    return await this.generalService.toggleGeneralLike();
  }

  // 댓글 수정
  @Put("comment")
  async updateGeneralComment(@Body() body) {
    return await this.generalService.updateGeneralComment();
  }

  // 대댓글 수정
  @Put("reply")
  async updateGeneralCommentReply(@Body() body) {
    return await this.generalService.updateGeneralCommentReply();
  }

  // 투표 신고
  @Put("report")
  async reportGeneral(@Body() body) {
    return await this.generalService.reportGeneral();
  }

  // 댓글 신고
  @Put("report/comment")
  async reportGeneralComment(@Body() body) {
    return await this.generalService.reportGeneralComment();
  }

  // 대댓글 신고
  @Put("report/reply")
  async reportGeneralCommentReply(@Body() body) {
    return await this.generalService.reportGeneralCommentReply();
  }

  // Delete Requests
  // 투표 삭제
  @Delete("")
  async deleteGeneral(@Headers() header) {
    return await this.generalService.deleteGeneral();
  }
}
