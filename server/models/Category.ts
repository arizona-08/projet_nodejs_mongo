import { Schema, model, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  type: "gym" | "exercise";
}

const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true, unique: true },
  type: { type: String, enum: ["gym", "exercise"], required: true }
});

export const Category = model<ICategory>("Category", categorySchema);