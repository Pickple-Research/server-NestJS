import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class ParticipatedResearch {
  @Prop()
  researchId: string;
}

export const ParticipatedResearchSchema =
  SchemaFactory.createForClass(ParticipatedResearch);
