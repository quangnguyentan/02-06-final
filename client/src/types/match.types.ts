import { League } from "./league.types";
import { Sport } from "./sport.types";
import { Team } from "./team.types";
import { User } from "./user.types";
interface IStreamLink {
  _id?: string; // Optional ID for the stream link
  label?: string;
  url?: string;
  image?: string; // Hình ảnh đại diện cho link stream
  commentator?: User | string;
  commentatorImage?: string;
  priority?: number;
}
export type Match = {
  _id?: string;
  title?: string;
  slug?: string;
  homeTeam?: Team;
  awayTeam?: Team;
  league?: League;
  sport?: Sport;
  startTime?: Date;
  status?: MatchStatusType; // Sử dụng enum đã định nghĩa
  scores?: {
    homeScore?: number;
    awayScore?: number;
  };
  streamLinks?: IStreamLink[];
  isHot?: boolean;
};
export enum MatchStatusType {
  UPCOMING = "UPCOMING",
  LIVE = "LIVE",
  FINISHED = "FINISHED",
  POSTPONED = "POSTPONED",
  CANCELLED = "CANCELLED",
}
export interface DateTabInfo {
  id: string; // YYYY-MM-DD
  label: string; // "Hôm Nay", "T4", "T5"
  dateSuffix: string; // "03/06"
  isToday?: boolean;
  hasLive?: boolean; // To show a live indicator on the tab
}

export interface LeagueSchedule {
  id: string;
  name: string;
  icon: React.ReactNode; // Specific icon for the league header
  matches: Match[]; // Ensure matches are of type Match
}
