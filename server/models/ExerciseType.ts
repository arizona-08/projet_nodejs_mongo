import mongoose, { Schema, Document } from 'mongoose';

export interface IExerciseType extends Document {
  name: string;
  description: string;
  muscles: string[];
  calories: number
}

const ExerciseTypeSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  muscles: { type: [String], required: true },
  calories: { type: Number, required: true },
});

export const ExerciseType = mongoose.model<IExerciseType>('ExerciseType', ExerciseTypeSchema);