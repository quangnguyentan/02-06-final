import * as React from "react";
import { HomeIconSolid, ChevronRightIcon } from "./Icon";
import { useNavigate } from "react-router-dom";
import { useSelectedPageContext } from "@/hooks/use-context";
import { VideoReels } from "@/types/videoReel.type";

interface VideoReelStreamBreadcrumbsProps {
  reel: VideoReels;
}

const VideoReelStreamBreadcrumbs: React.FC<VideoReelStreamBreadcrumbsProps> = ({
  reel,
}) => {
  const navigate = useNavigate();
  const { setSelectedSportsNavbarPage, setSelectedPage } =
    useSelectedPageContext();

  return (
    <nav
      className="text-xs text-gray-400 mb-2 px-1 flex items-center space-x-0.5 pt-4"
      aria-label="Breadcrumb"
    >
      <div
        onClick={() => {
          navigate("/");
          localStorage.removeItem("selectedSportsNavbarPage");
          setSelectedSportsNavbarPage("");
          localStorage.setItem("selectedPage", "TRANG CHỦ");
          setSelectedPage("TRANG CHỦ");
        }}
        className="hover:text-yellow-400 flex items-center text-xs text-white hover:text-xs cursor-pointer"
      >
        <HomeIconSolid className="w-3.5 h-3.5 mr-1" /> Trang chủ
      </div>
      <ChevronRightIcon className="w-3 h-3 text-gray-500" />
      <div
        onClick={() => {
          navigate("/video-xem-lai");
          localStorage.setItem(
            "selectedSportsNavbarPage",
            reel?.sport?.name || ""
          );
          setSelectedSportsNavbarPage(reel?.sport?.name || "");
          localStorage.setItem("selectedPage", "VIDEO XEM LẠI");
          setSelectedPage("VIDEO XEM LẠI");
        }}
        className="hover:text-yellow-400 text-xs text-white hover:text-xs cursor-pointer"
      >
        Thước phim ngắn
      </div>
      <ChevronRightIcon className="w-3 h-3 text-gray-500" />
      <div className="text-xs text-current-color hover:text-xs">
        {reel?.sport?.name || "Thể loại"}
      </div>
      <ChevronRightIcon className="w-3 h-3 text-gray-500" />
      <span
        className="text-current-color truncate max-w-[120px] xs:max-w-[180px] sm:max-w-xs"
        title={reel?.title}
      >
        {reel?.title}
      </span>
    </nav>
  );
};

export default VideoReelStreamBreadcrumbs;
