import * as React from "react";
import { PlayCircleIconSolid as DefaultPlayIcon } from "./Icon";
import { useNavigate } from "react-router-dom";
import { VideoReels } from "@/types/videoReel.type";
import { formatDuration } from "@/lib/helper";
import { useSelectedPageContext } from "@/hooks/use-context";

interface VideoReelCardProps {
  reel: VideoReels;
  variant?: "default" | "compact";
}

const VideoReelCard: React.FC<VideoReelCardProps> = ({
  reel,
  variant = "default",
}) => {
  const { setSelectedSportsNavbarPage, setSelectedPage } =
    useSelectedPageContext();
  const navigate = useNavigate();
  const targetUrl = `/video-reel/${encodeURIComponent(reel.title || "video")}/${
    reel.sport?.slug || ""
  }`;
  const [isVisible, setIsVisible] = React.useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  if (!isVisible) return <div ref={cardRef} className="h-32 sm:h-40" />;

  if (variant === "compact") {
    return (
      <div
        onClick={() => {
          navigate(targetUrl);
          localStorage.setItem("selectedPage", "VIDEO XEM LẠI");
          setSelectedPage("VIDEO XEM LẠI");
          setSelectedSportsNavbarPage(reel?.sport?.name ?? "");
          localStorage.setItem(
            "selectedSportsNavbarPage",
            reel?.sport?.name ?? ""
          );
          localStorage.setItem("setByVideoReelCard", "true");
        }}
        className="flex items-center space-x-3 group p-1.5 rounded-md transition-colors duration-150 cursor-pointer"
      >
        <div className="flex-grow overflow-hidden">
          <h3
            className="text-sm sm:text-[15px] font-semibold text-white leading-snug group-hover:text-blue-500 transition-colors mb-0.5"
            title={reel.title}
          >
            {reel.title}
          </h3>
          {reel.commentator &&
            reel.title &&
            !reel?.title
              .toLowerCase()
              .includes(
                (typeof reel.commentator === "string"
                  ? reel.commentator
                  : reel.commentator?.username || ""
                ).toLowerCase()
              ) && (
              <p className="text-[10px] sm:text-[11px] text-gray-400 truncate">
                BLV:{" "}
                {typeof reel.commentator === "string"
                  ? reel.commentator
                  : reel.commentator?.username}
              </p>
            )}
          <p className="text-[10px] sm:text-[13px] text-gray-400 group-hover:text-gray-400">
            {reel?.sport?.name} -{" "}
            {new Date(reel?.publishDate ?? "").toLocaleString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })}
          </p>
        </div>
        <div className="relative flex-shrink-0">
          <img
            src={reel?.thumbnail}
            alt={reel.title}
            className="w-[100px] h-[60px] sm:w-[120px] sm:h-[70px] object-cover rounded"
          />
          <div className="absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-40 flex items-center justify-center transition-opacity duration-300 rounded">
            <DefaultPlayIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white opacity-60 group-hover:opacity-100 transition-opacity" />
          </div>
          {reel?.duration && (
            <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-[10px] px-1.5 py-0.5 rounded-sm font-medium">
              {formatDuration(reel?.duration)}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => {
        navigate(targetUrl);
        localStorage.setItem("selectedPage", "VIDEO XEM LẠI");
        setSelectedPage("VIDEO XEM LẠI");
        setSelectedSportsNavbarPage(reel?.sport?.name ?? "");
        localStorage.setItem(
          "selectedSportsNavbarPage",
          reel?.sport?.name ?? ""
        );
        localStorage.setItem("setByVideoReelCard", "true");
      }}
      className="block rounded-lg shadow-2xl overflow-hidden group cursor-pointer  rounded-none md:rounded-xl"
      ref={cardRef}
    >
      <div className="relative">
        <img
          src={reel?.thumbnail}
          alt={reel.title}
          loading="lazy"
          className="w-full h-full sm:h-96 object-cover transition-transform duration-300 group-hover:scale-105 "
        />
        <div className="absolute inset-0 bg-opacity-20 group-hover:bg-opacity-40 flex items-center justify-center transition-opacity duration-300">
          <DefaultPlayIcon className="w-10 h-10 sm:w-12 sm:h-12 text-white opacity-70 group-hover:opacity-100" />
        </div>
        <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-[11px] sm:text-xs px-2 py-1 rounded-sm">
          {new Date(reel?.publishDate ?? "").toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          })}
        </div>
      </div>
      <div className="p-2 sm:p-3">
        <h3
          className="text-xs sm:text-sm font-semibold text-white group-hover:text-blue-500 transition-colors"
          title={reel.title}
        >
          {reel.title}
        </h3>
      </div>
    </div>
  );
};

export default VideoReelCard;
