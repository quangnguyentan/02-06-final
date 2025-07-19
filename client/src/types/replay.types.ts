import { Match } from "./match.types";
import { Sport } from "./sport.types";

export type Replay = {
  _id?: string;
  title?: string;
  slug?: string;
  description?: string;
  videoUrl?: string;
  thumbnail?: string;
  match?: Match;
  duration?: number;
  views?: number;
  commentator?: string;
  sport?: Sport;
  publishDate?: Date;
  isShown?: boolean;
};

export interface FeaturedBroadcastItem {
  id?: string;
  playerImage?: string;
  playerName?: string;
  time?: string; // e.g., "16:00 ---"
  opponentName: string;
  commentator: string;
}

export interface HighlightedEventInfo {
  playerImages: string[]; // URLs for the 3 smaller images
  description: string; // e.g., "Tennis Roland Garros Carlos Alcaraz vs Ben Shelton"
  commentatorInfo: string; // e.g., "BLV My Tom | 01.06.25"
  dateDisplay: string; // e.g., "01/06"
  replay?: Replay;
}

export interface CategorizedReplayGroup {
  id: string;
  title: string;
  icon: React.ReactNode;
  replays: Replay[];
  viewAllUrl?: string;
}
