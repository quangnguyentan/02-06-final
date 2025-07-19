import * as React from "react";
import { PlayCircleIconSolid as DefaultPlayIcon } from "./Icon";
import { useNavigate } from "react-router-dom";
import { Replay } from "@/types/replay.types";
import { formatDuration } from "@/lib/helper";
import { useSelectedPageContext } from "@/hooks/use-context";

interface ReplayCardProps {
  replay: Replay;
  variant?: "default" | "compact"; // compact for sidebar
}

const ReplayCard: React.FC<ReplayCardProps> = ({
  replay,
  variant = "default",
}) => {
  const { setSelectedSportsNavbarPage, setSelectedPage } =
    useSelectedPageContext();
  const navigate = useNavigate();
  // const targetUrl = replay.url || "/replay";
  const targetUrl = `/xem-lai/${replay?.title}`;
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
          localStorage.setItem("selectedPage", "XEM LẠI"); // Set selected page
          setSelectedPage("XEM LẠI");
          setSelectedSportsNavbarPage(replay?.sport?.name ?? "");
          localStorage.setItem(
            "selectedSportsNavbarPage",
            replay?.sport?.name ?? ""
          );
          localStorage.setItem("setByReplayCard", "true"); // Set flag
        }}
        className="flex items-center space-x-3 group p-1.5  rounded-md transition-colors duration-150 cursor-pointer"
      >
        <div className="flex-grow overflow-hidden">
          <h3
            className="text-sm sm:text-[15px] font-semibold text-white leading-snug group-hover:text-blue-500 transition-colors mb-0.5"
            title={replay.title}
          >
            {replay.title}
          </h3>
          {replay.commentator &&
            replay.title &&
            !replay?.title
              .toLowerCase()
              .includes(replay.commentator.toLowerCase()) && (
              <p className="text-[10px] sm:text-[11px] text-gray-400 truncate">
                BLV: {replay.commentator}
              </p>
            )}
          <p className="text-[10px] sm:text-[13px] text-gray-400 group-hover:text-gray-400">
            {replay?.sport?.name} -{" "}
            {new Date(replay?.publishDate ?? "").toLocaleString("vi-VN", {
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
            src={replay?.thumbnail}
            alt={replay.title}
            className="w-[100px] h-[60px] sm:w-[120px] sm:h-[70px] object-cover rounded"
          />
          <div className="absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-40 flex items-center justify-center transition-opacity duration-300 rounded">
            <DefaultPlayIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white opacity-60 group-hover:opacity-100 transition-opacity" />
          </div>
          {replay?.duration && (
            <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-[10px] px-1.5 py-0.5 rounded-sm font-medium">
              {formatDuration(replay?.duration)}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div
      onClick={() => {
        navigate(targetUrl);
        localStorage.setItem("selectedPage", "XEM LẠI"); // Set selected page
        setSelectedPage("XEM LẠI");
        setSelectedSportsNavbarPage(replay?.sport?.name ?? "");
        localStorage.setItem(
          "selectedSportsNavbarPage",
          replay?.sport?.name ?? ""
        );
        localStorage.setItem("setByReplayCard", "true"); // Set flag
      }}
      className="block rounded-lg shadow-2xl overflow-hidden group cursor-pointer"
      ref={cardRef}
    >
      <div className="relative">
        <img
          src={replay?.thumbnail}
          alt={replay.title}
          loading="lazy"
          className="w-full h-32 sm:h-40 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0  bg-opacity-20 group-hover:bg-opacity-40 flex items-center justify-center transition-opacity duration-300">
          <DefaultPlayIcon className="w-10 h-10 sm:w-12 sm:h-12 text-white opacity-70 group-hover:opacity-100" />
        </div>
        <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-[11px] sm:text-xs px-2 py-1 rounded-sm">
          {new Date(replay?.publishDate ?? "").toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          })}
        </div>
        {replay?.duration && (
          <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-[11px] sm:text-xs px-1.5 py-0.5 rounded-sm">
            {formatDuration(replay?.duration)}
          </div>
        )}
      </div>
      <div className="p-2 sm:p-3">
        <h3
          className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-blue-500 transition-colors"
          title={replay.title}
        >
          {replay.title}
        </h3>
        {replay.commentator && (
          <p className="text-[11px] sm:text-xs text-gray-400 truncate">
            BLV {replay.commentator} -{" "}
            <span className="text-[11px] sm:text-xs text-gray-500">
              {replay?.sport?.name}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default ReplayCard;
