import { Schema, model, Document } from "mongoose";

export interface IReward extends Document {
  name: string;
  description: string;
  condition: string; // Règle d'attribution dynamique (ex: "all_badges")
}

const rewardSchema = new Schema<IReward>({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  condition: { type: String, required: true }
});

export const Reward = model<IReward>("Reward", rewardSchema);