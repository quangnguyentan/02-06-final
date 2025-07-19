import * as React from "react";
import { TVIcon } from "./Icon";
import { VideoReels } from "@/types/videoReel.type";
import VideoReelCard from "./VideoReelCard";
import { useMediaQuery, useTheme } from "@mui/material";

interface VideoReelSuggestionsPanelProps {
  reels: VideoReels[];
  title?: string;
  titleHidden?: boolean;
}

const VideoReelSuggestionsPanel: React.FC<VideoReelSuggestionsPanelProps> = ({
  reels,
  title = "THƯỚC PHIM NGẮN",
  titleHidden,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  if (!reels || reels.length === 0) {
    return (
      <div className="bg-slate-800 p-2 sm:p-3 rounded-lg shadow text-center text-gray-500 text-xs sm:text-sm">
        Không có video xem lại.
      </div>
    );
  }

  return (
    <div className="rounded-lg shadow">
      <div className="space-y-1 max-h-[720px] md:max-h-[800px] overflow-y-auto pr-1 custom-scrollbar">
        {!titleHidden && (
          <div className="flex items-center space-x-2 px-2 w-full">
            <TVIcon className="w-5 h-5 text-yellow-400" />
            <h6 className="text-sm sm:text-base font-bold text-white">
              {title}
            </h6>
          </div>
        )}
        {reels.slice(0, 6).map((reel, index) => (
          <VideoReelCard
            key={reel?._id}
            reel={reel}
            // variant={index === 0 ? "default" : "compact"}
            variant={"compact"}
          />
        ))}
      </div>
    </div>
  );
};

export default VideoReelSuggestionsPanel;
