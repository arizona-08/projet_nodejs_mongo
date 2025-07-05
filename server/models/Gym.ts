import mongoose, { Schema, Document } from 'mongoose';

export interface IGym extends Document {
  name: string;
  address: string;
  equipments: string[];
  description: string;
  activities: string[];
  owner: mongoose.Types.ObjectId;
  approved: boolean;
}

const GymSchema: Schema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  equipments: { type: [String], default: [] },
  description: { type: String, required: true },
  activities: { type: [String], default: [] },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  approved: { type: Boolean, default: false },
});

export const Gym = mongoose.model<IGym>('Gym', GymSchema);
