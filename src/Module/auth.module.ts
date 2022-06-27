import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "src/Controller";
import { AuthService } from "src/Service";
import {
  MongoUserModule,
  MongoResearchModule,
  MongoVoteModule,
} from "src/Mongo";

/**
 * 로그인, 정규유저 전환 기능을 담당합니다.
 * @author 현웅
 */
@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    MongoUserModule,
    MongoResearchModule,
    MongoVoteModule,
    //? authController에서 jwtService를 사용하고 있으므로 imports에 포함시킵니다
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "14d" },
    }),
  ],
})
export class AuthModule {}
