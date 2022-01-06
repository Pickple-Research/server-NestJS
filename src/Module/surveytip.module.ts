import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SurveytipController } from "../Controller";
import { SurveytipService } from "../Service";
import { Surveytip, SurveytipSchema } from "../Schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Surveytip.name, schema: SurveytipSchema },
    ]),
  ],
  controllers: [SurveytipController],
  providers: [SurveytipService],
})
export class SurveytipModule {}
