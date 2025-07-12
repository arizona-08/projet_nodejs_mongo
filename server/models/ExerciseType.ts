import mongoose, { Schema, Document } from 'mongoose';

export interface IExerciseType extends Document {
  name: string;
  description: string;
  muscles: string[];
}

const ExerciseTypeSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  muscles: { type: [String], required: true }
});

export const ExerciseType = mongoose.model<IExerciseType>('ExerciseType', ExerciseTypeSchema);