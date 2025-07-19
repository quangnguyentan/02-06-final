import * as React from "react";

export interface Team {
  name: string;
  logoUrl: string;
}

export interface Match {
  id: string;
  sportName: string; // e.g., Bóng đá, Bóng rổ
  leagueName: string;
  leagueShortName?: string; // Optional short name for concise display e.g. "V-League"
  leagueIcon?: React.ReactNode; // Optional: Icon for the league displayed in schedule
  teamA: Team;
  teamB: Team;
  scoreA?: number;
  scoreB?: number;
  time: string; // e.g., "08:45" or "16:00"
  date: string; // e.g., "03/06" - often part of a larger date context
  isLive: boolean;
  liveStatus?: string; // e.g., "LIVE", "3Q"
  liveBadgeColor?: string; // e.g., 'bg-red-500', 'bg-orange-500'
  streamerName?: string;
  streamerAvatarUrl?: string;
  matchUrl?: string; // Link for "Xem Ngay"
  betUrl?: string; // Link for "Đặt Cược"
  showBetButton?: boolean;
  description?: string; // e.g., "Xem ThapCamTV trực tiếp trận đấu: Giants vs Padres Lúc 08:45 Ngày 03/06/2025"
  category?: string; // e.g. "Môn Khác" for breadcrumbs
}

export interface SportCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  url?: string;
}

export interface Replay {
  id: string;
  title: string;
  sportType: string; // Technical category e.g., "football", "tennis"
  categoryDisplayName?: string; // User-facing category name e.g., "Bóng Đá", "Sự kiện đặc biệt"
  date: string; // e.g., "01/06/25"
  thumbnailUrl: string;
  videoUrl?: string; // URL for the actual video stream
  url?: string; // URL for the replay page itself
  commentator?: string; // e.g., BLV Người Mộng Mơ
  duration?: string; // e.g., 01:20:25
}

export interface NavItem {
  label: string;
  url: string;
  slug?: string;
  nameForHighlight?: string;
}

export interface ChatMessage {
  id: string;
  user: string;
  avatar?: string;
  message: string;
  timestamp: string;
  userColor?: string; // Optional: for styling usernames
}

// Types for Schedule Page & Results Page

// Types for Replay Hub Page
export interface FeaturedPlayerInfo {
  name: string;
  imageUrl: string;
}
