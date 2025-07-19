import { Schema, model, Document, Types } from "mongoose";
import { ISport } from "./sport.model"; // Import interface của Sport

export interface ILeague extends Document {
  name: string;
  slug: string;
  logo?: string;
  sport: Types.ObjectId | ISport; // Có thể là ObjectId hoặc một document Sport đã được populate
}

const leagueSchema = new Schema<ILeague>(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    logo: {
      type: String,
    },
    sport: {
      type: Schema.Types.ObjectId,
      ref: "Sport",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model<ILeague>("League", leagueSchema);
