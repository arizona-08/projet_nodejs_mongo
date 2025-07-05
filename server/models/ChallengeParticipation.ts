import mongoose, { Schema, Document } from 'mongoose';

export type ParticipationStatus = 'en cours' | 'terminé';

export interface IChallengeParticipation extends Document {
  challenge: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  status: ParticipationStatus;
  startedAt?: Date;
  finishedAt?: Date;
}

const ChallengeParticipationSchema: Schema = new Schema({
  challenge: { type: Schema.Types.ObjectId, ref: 'Challenge', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['en cours', 'terminé'], required: true },
  startedAt: { type: Date },
  finishedAt: { type: Date },
});

export const ChallengeParticipation = mongoose.model<IChallengeParticipation>('ChallengeParticipation', ChallengeParticipationSchema);
