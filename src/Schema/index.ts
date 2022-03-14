// Banner_Notice_Surveytip  배너, 공지사항 등 서버 측에서 수정하는 정보
export * from "./Banner_Notice_Surveytip/banner.schema";
export * from "./Banner_Notice_Surveytip/notice.schema";
export * from "./Banner_Notice_Surveytip/surveytip.schema";

// Content : Surbay 자체 기획 콘텐츠 게시판
export * from "./Content/content.schema";
export * from "./Content/contentComment.schema";

// Feedback : 유저 피드백
export * from "./Feedback/feedback.schema";
export * from "./Feedback/feedbackComment.schema";

//TODO: 이름 변경
// General : 커뮤니티 투표
export * from "./General/general.schema";
export * from "./General/generalComment.schema";
export * from "./General/generalPoll.schema";

// Reply : 대댓글
export * from "./Comment_Reply/comment.schema";
export * from "./Comment_Reply/reply.schema";

// Research : 기본 설문
export * from "./Research/research.schema";
export * from "./Research/researchComment.schema";

// User : 유저
export * from "./User/user.schema";
// 유저별 알람
export * from "./User/ReferencingSchema/userNotification.schema";
// 유저 세부정보
export * from "./User/ReferencingSchema/userDetailedInfo.schema";
