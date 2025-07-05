import mongoose, { Schema, Document } from 'mongoose';

export type Difficulty = 'facile' | 'moyen' | 'difficile';

export interface IChallenge extends Document {
  title: string;
  description: string;
  duration: number;
  difficulty: Difficulty;
  type: string;
  creator: mongoose.Types.ObjectId;
  gym: mongoose.Types.ObjectId;
}

const ChallengeSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  difficulty: { type: String, enum: ['facile', 'moyen', 'difficile'], required: true },
  type: { type: String, required: true },
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  gym: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
});

export const Challenge = mongoose.model<IChallenge>('Challenge', ChallengeSchema);
