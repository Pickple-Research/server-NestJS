import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class ParticipatedVote {
  @Prop()
  voteId: string;
}

export const ParticipatedVoteSchema =
  SchemaFactory.createForClass(ParticipatedVote);
