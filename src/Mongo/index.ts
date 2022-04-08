/**
 * MongoDB를 직접 조작하는 Service, 그리고 그 서비스들을 제공하는 Module들을 모두 export합니다.
 * 각 Service는 데이터 처리 방식에 따라
 * 검색(find), 생성(create), 수정(update), 삭제(delete) 등으로 구분되어 있습니다.
 * 이 모듈을 어떻게 사용하는지는 mongo.user.module.ts 를 참고하세요.
 * @author 현웅
 */

// Feedback
export * from "./Feedback/mongo.feedback.find.service";
export * from "./Feedback/mongo.feedback.module";

// Notice
export * from "./Notice/mongo.notice.find.service";
export * from "./Notice/mongo.notice.module";

// Research
export * from "./Research/mongo.research.create.service";
export * from "./Research/mongo.research.find.service";
export * from "./Research/mongo.research.module";

// User
export * from "./User/mongo.user.create.service";
export * from "./User/mongo.user.delete.service";
export * from "./User/mongo.user.find.service";
export * from "./User/mongo.user.module";

// Vote
export * from "./Vote/mongo.vote.find.service";
export * from "./Vote/mongo.vote.module";
