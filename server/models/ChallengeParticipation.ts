import mongoose, { Schema, Document } from 'mongoose';

export type ParticipationStatus = 'en cours' | 'terminé';
export type ExerciseStatus = 'pas commencé' | 'terminé' 

export interface IProgressionExercise extends Document {
  exercise: mongoose.Types.ObjectId;
  status: ExerciseStatus;
  duration_sec: number;
}

export interface IChallengeParticipation extends Document {
  challenge: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  status: ParticipationStatus;
  startedAt?: Date;
  finishedAt?: Date;
  progression: IProgressionExercise[];
  burned_calories: number
}

const ChallengeParticipationSchema: Schema = new Schema({
  challenge: { type: Schema.Types.ObjectId, ref: 'Challenge', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['en cours', 'terminé'], required: true },
  startedAt: { type: Date },
  finishedAt: { type: Date },
  progression: [
    {
      _id: false,
      exercise: { type: Schema.Types.ObjectId, ref: 'ExerciseType', required: true },
      status: { type: String, enum: ['pas commencé', 'terminé'], default: 'pas commencé' },
      duration_sec: { type: Number, default: 0}
    }
  ],
  burned_calories: {type: Number, default: 0}
});

export const ChallengeParticipation = mongoose.model<IChallengeParticipation>('ChallengeParticipation', ChallengeParticipationSchema);
