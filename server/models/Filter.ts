import { Schema, model, Document } from "mongoose";

export interface IFilter extends Document {
  name: string;
  type: "gym" | "exercise";
}

const filterSchema = new Schema<IFilter>({
  name: { type: String, required: true, unique: true },
  type: { type: String, enum: ["gym", "exercise"], required: true }
});

export const Filter = model<IFilter>("Filter", filterSchema);