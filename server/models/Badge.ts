import { Schema, model, Document } from "mongoose";

export interface IBadge extends Document {
  name: string;
  description: string;
  icon?: string;
}

const badgeSchema = new Schema<IBadge>({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  icon: { type: String }
});

export const Badge = model<IBadge>("Badge", badgeSchema);