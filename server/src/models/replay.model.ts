import { Schema, model, Document, Types } from "mongoose";
import { IMatch } from "./match.model";
import { ISport } from "./sport.model";

export interface IReplay extends Document {
  title: string;
  slug: string;
  description?: string;
  videoUrl: string;
  thumbnail?: string;
  match: Types.ObjectId | IMatch;
  sport: Types.ObjectId | ISport; // (Required) Video này thuộc môn nào
  commentator?: string;
  views: number;
  duration?: number; // Thời lượng (giây)
  publishDate: Date; // Ngày đăng video
  isShown?: boolean;
}

const replaySchema = new Schema<IReplay>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    videoUrl: { type: String, required: true },
    thumbnail: { type: String },
    match: { type: Schema.Types.ObjectId, ref: "Match" },
    duration: { type: Number },
    views: { type: Number, default: 0 },
    commentator: { type: String },
    sport: { type: Schema.Types.ObjectId, ref: "Sport", required: true },
    publishDate: { type: Date, default: Date.now, index: true },
    isShown: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default model<IReplay>("Replay", replaySchema);
