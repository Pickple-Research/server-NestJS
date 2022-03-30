import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { GeneralController } from "../Controller";
import { GeneralService } from "../Service";
import { General, GeneralSchema } from "../OldSchema";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: General.name, schema: GeneralSchema }],
      "main",
    ),
  ],
  controllers: [GeneralController],
  providers: [GeneralService],
})
export class GeneralModule {}
