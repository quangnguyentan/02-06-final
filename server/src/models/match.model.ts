import { Schema, model, Document, Types } from "mongoose";
import { ITeam } from "./team.model";
import { ILeague } from "./league.model";
import { ISport } from "./sport.model";

// Dùng enum để quản lý trạng thái, tránh lỗi gõ sai chuỗi
export enum MatchStatus {
  UPCOMING = "UPCOMING",
  LIVE = "LIVE",
  FINISHED = "FINISHED",
  POSTPONED = "POSTPONED",
  CANCELLED = "CANCELLED",
}

// Interface cho sub-document stream link
interface IStreamLink {
  label: string;
  url: string;
  image?: string;
  commentator?: Types.ObjectId;
  commentatorImage?: string;
  priority: number;
}

export interface IMatch extends Document {
  title: string;
  slug: string;
  homeTeam: Types.ObjectId | ITeam;
  awayTeam: Types.ObjectId | ITeam;
  league: Types.ObjectId | ILeague;
  sport: Types.ObjectId | ISport;
  startTime: Date;
  status: MatchStatus; // Sử dụng enum đã định nghĩa
  scores: {
    homeScore: number;
    awayScore: number;
  };
  streamLinks: IStreamLink[];
  isHot: boolean;
}

const matchSchema = new Schema<IMatch>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    homeTeam: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    awayTeam: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    league: { type: Schema.Types.ObjectId, ref: "League", required: true },
    sport: { type: Schema.Types.ObjectId, ref: "Sport", required: true },

    startTime: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: Object.values(MatchStatus), // Lấy các giá trị từ enum
      default: MatchStatus.UPCOMING,
      index: true,
    },
    scores: {
      homeScore: { type: Number, default: 0 },
      awayScore: { type: Number, default: 0 },
    },
    streamLinks: [
      {
        label: { type: String },
        url: { type: String },
        image: { type: String },
        commentator: { type: Schema.Types.ObjectId, ref: "User" },
        commentatorImage: { type: String },
        priority: { type: Number, default: 1 },
      },
    ],
    isHot: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default model<IMatch>("Match", matchSchema);
