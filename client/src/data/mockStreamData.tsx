import { Replay } from "../types/index.types";

const placeholderThumbnail = (
  seed: string,
  width: number = 300,
  height: number = 160
) => `https://picsum.photos/seed/${seed}/${width}/${height}`;

export const mockMainReplayItem: Replay = {
  id: "superbowl_2024_replay",
  title: "Trận tranh Super Bowl 2024 | BLV Người Húc | 12.2.24",
  sportType: "special_event",
  categoryDisplayName: "Sự kiện đặc biệt",
  date: "12/02/2024",
  thumbnailUrl: placeholderThumbnail("super_bowl_main_thumb"), // Not directly used on this page, but good for consistency
  videoUrl:
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", // Placeholder video
  url: "#", // Link to this stream page
  commentator: "BLV Người Húc",
  duration: "5:03:20", // As seen in image
};

export const mockSidebarReplaysForStreamPage: Replay[] = [
  {
    id: "olympics_opening_sidebar",
    title: "Khai mạc Olympics 2024 | BLV Người Hùng | 27.7.24",
    sportType: "special_event",
    categoryDisplayName: "Sự kiện đặc biệt",
    date: "27/07/2024",
    thumbnailUrl:
      "https://via.placeholder.com/120x70/2D3748/FFFFFF?text=Olympics",
    duration: "3:15:00",
    url: "#",
  },
  {
    id: "ballon_dor_sidebar",
    title: "Trao giải Quả Bóng Vàng 2023 - MESSI!!!! | 31.10.23",
    sportType: "special_event",
    categoryDisplayName: "Sự kiện đặc biệt",
    date: "31/10/2023",
    thumbnailUrl:
      "https://via.placeholder.com/120x70/4A5568/FFFFFF?text=BallonDor",
    duration: "1:45:30",
    url: "#",
  },
  {
    id: "world_cup_final_sidebar",
    title:
      "Chung kết World Cup 2022 Argentina vs France | BLV Kinh Điển | 18.12.22",
    sportType: "football",
    categoryDisplayName: "Bóng Đá",
    date: "18/12/2022",
    thumbnailUrl:
      "https://via.placeholder.com/120x70/68D391/000000?text=WC2022",
    duration: "3:30:00",
    url: "#",
  },
  {
    id: "f1_monaco_sidebar",
    title: "F1 Monaco Grand Prix Highlights | BLV Tốc Độ | 28.05.2024",
    sportType: "racing",
    categoryDisplayName: "Đua Xe",
    date: "28/05/2024",
    thumbnailUrl:
      "https://via.placeholder.com/120x70/F56565/FFFFFF?text=F1Monaco",
    duration: "0:55:10",
    url: "#",
  },
];
