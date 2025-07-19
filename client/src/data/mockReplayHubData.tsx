import * as React from "react";
import {
  FeaturedBroadcastItem,
  HighlightedEventInfo,
  CategorizedReplayGroup,
  Replay,
} from "../types/replay.types";
import {
  StarIcon,
  FootballIcon,
  TennisIcon,
  BasketballIcon,
  VolleyballIcon,
} from "@/components/layout/Icon";

const placeholderImg = (
  seed: string,
  width: number = 100,
  height: number = 140
) => `https://picsum.photos/seed/${seed}/${width}/${height}`;

export const mockFeaturedBroadcasts: FeaturedBroadcastItem[] = [
  {
    id: "fb1",
    playerImage: placeholderImg("tommy_paul"),
    playerName: "Tommy Paul",
    time: "16:00 ---",
    opponentName: "Alexei Popyrin",
    commentator: "Người Cũn",
  },
  {
    id: "fb2",
    playerImage: placeholderImg("carlos_alcaraz"),
    playerName: "Carlos Alcaraz",
    time: "19:00 ---",
    opponentName: "Ben Shelton",
    commentator: "Mỹ Tôm",
  },
  {
    id: "fb3",
    playerImage: placeholderImg("frances_tiafoe"),
    playerName: "Frances Tiafoe",
    time: "21:00 ---",
    opponentName: "Daniel Altmaier",
    commentator: "Người Huc",
  },
  {
    id: "fb4",
    playerImage: placeholderImg("lorenzo_musetti"),
    playerName: "Lorenzo Musetti",
    time: "01:15 ---",
    opponentName: "Holger Rune",
    commentator: "Trp Sbr",
  },
  {
    id: "fb5",
    playerImage: placeholderImg("iga_swiatek"),
    playerName: "Iga Swiatek",
    time: "14:00 ---",
    opponentName: "Aryna Sabalenka",
    commentator: "BLV TennisPro",
  },
];

export const mockHighlightedEventData: HighlightedEventInfo = {
  playerImages: [
    placeholderImg("ben_shelton_small", 80, 110),
    placeholderImg("carlos_alcaraz_small", 80, 110),
    placeholderImg("holger_rune_small", 80, 110),
  ],
  description: "Tennis Roland Garros Carlos Alcaraz vs Ben Shelton",
  commentatorInfo: "BLV Mỹ Tôm | 01.06.25",
  dateDisplay: "01/06",
};

export const mockCategorizedReplays: CategorizedReplayGroup[] = [
  {
    id: "special_events",
    title: "SỰ KIỆN ĐẶC BIỆT",
    icon: React.createElement(StarIcon, {
      className: "w-5 h-5 text-yellow-400",
    }),
    replays: [],
    viewAllUrl: "#",
  },
  {
    id: "football",
    title: "BÓNG ĐÁ",
    icon: React.createElement(FootballIcon, {
      className: "w-5 h-5 text-green-400",
    }),
    replays: [],
    viewAllUrl: "#",
  },
  {
    id: "tennis",
    title: "TENNIS",
    icon: React.createElement(TennisIcon, {
      className: "w-5 h-5 text-lime-400",
    }),
    replays: [],
    viewAllUrl: "#",
  },
  {
    id: "basketball",
    title: "BÓNG RỔ",
    icon: React.createElement(BasketballIcon, {
      className: "w-5 h-5 text-orange-400",
    }),
    replays: [],
    viewAllUrl: "#",
  },
  {
    id: "volleyball",
    title: "BÓNG CHUYỀN",
    icon: React.createElement(VolleyballIcon, {
      className: "w-5 h-5 text-sky-400",
    }),
    replays: [],
    viewAllUrl: "#",
  },
];

export const mockSidebarReplaysForHub: Replay[] = [];
