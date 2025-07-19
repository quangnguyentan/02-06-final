import { Schema, model, Document, Types } from "mongoose";
import { ILeague } from "./league.model";
import { IMatch } from "./match.model";

// Enum for banner positions
export enum BannerPosition {
    TOP = "TOP",
    BOTTOM = "BOTTOM",
    SIDEBAR_LEFT = "SIDEBAR_LEFT",
    SIDEBAR_RIGHT = "SIDEBAR_RIGHT",
    FOOTER = "FOOTER",
    POPUP = "POPUP",
    INLINE = "INLINE",
}

// Enum for page locations where banners are displayed
export enum DisplayPage {
    ALL_PAGE = "ALL_PAGE",
    HOMEPAGE = "HOME_PAGE",
    SHEDULE_PAGE = "SHEDULE_PAGE",
    RESULT_PAGE = "RESULT_PAGE",
    REPLAY_PAGE = "REPLAY_PAGE",
    LIVE_PAGE = "LIVE_PAGE",
    REPLAY_VIDEO_PAGE = "REPLAY_VIDEO_PAGE"
}

export interface IBanner extends Document {
    imageUrl: string;
    position: BannerPosition;
    displayPage: DisplayPage;
    link?: string; // Optional link to external URL, match, or league
    priority: number; // Order of display (lower number = higher priority)
    isActive: boolean; // Whether the banner is active
    startDate?: Date; // Optional start date for display
    endDate?: Date; // Optional end date for display
}

const bannerSchema = new Schema<IBanner>(
    {
        imageUrl: { type: String, required: true },
        position: {
            type: String,
            enum: Object.values(BannerPosition),
            required: true,
        },
        displayPage: {
            type: String,
            enum: Object.values(DisplayPage),
            required: true,
        },
        link: { type: String },
        priority: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
        startDate: { type: Date },
        endDate: { type: Date },
    },
    {
        timestamps: true,
    }
);

export default model<IBanner>("Banner", bannerSchema);