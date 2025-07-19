import { Schema, model, Document, Types } from "mongoose";
import { IMatch } from "./match.model";
import { ISport } from "./sport.model";
import { ILeague } from "./league.model";
import { IUser } from "./user.model";

export interface IVideoReels extends Document {
  title: string;
  slug: string;
  description?: string;
  videoUrl: string;
  thumbnail?: string;
  sport: Types.ObjectId | ISport; // Required reference to a sport
  commentator?: Types.ObjectId | IUser; // Optional reference to a commentator
  views: number;
  duration: number; // Duration in seconds (required for reels)
  publishDate: Date;
  isFeatured: boolean; // Highlighted reel (e.g., for homepage)
  order: number; // Order for display, useful for featured reels
}

const videoReelsSchema = new Schema<IVideoReels>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    videoUrl: { type: String, required: true },
    thumbnail: { type: String },
    sport: { type: Schema.Types.ObjectId, ref: "Sport", required: true },
    commentator: { type: Schema.Types.ObjectId, ref: "User" },
    views: { type: Number, default: 0 },
    duration: { type: Number, required: true }, // Required for short clips
    publishDate: { type: Date, default: Date.now, index: true },
    isFeatured: { type: Boolean, default: false },
    order: { type: Number, default: 1 }, // Mới thêm
  },
  {
    timestamps: true,
  }
);

export default model<IVideoReels>("VideoReels", videoReelsSchema);
