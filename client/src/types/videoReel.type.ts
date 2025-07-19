// types/videoReels.types.ts
import { Sport } from "@/types/sport.types";
import { User } from "@/types/user.types";
export interface VideoReels {
  _id?: string;
  title?: string;
  slug?: string;
  description?: string;
  videoUrl?: string;
  thumbnail?: string;
  sport?: Sport;
  commentator?: string | User;
  views?: number;
  duration?: number;
  publishDate?: string;
  isFeatured?: boolean;
  order?: number; // Order for display, useful for featured reels
  createdAt?: string;
  updatedAt?: string;
}
export interface CategorizedVideoReelGroup {
  id: string; // e.g., sport name or date
  title: string; // e.g., "Premier League" or "October 2025"
  replays: VideoReels[]; // Array of video reels
  icon?: React.ReactNode; // Optional icon for the category
  viewAllUrl?: string; // Optional URL for "View All" link
}
