import { UserIcon } from "./Icon"; // For streamer avatar fallback
import * as React from "react";
import { Match } from "@/types/match.types";
import { useNavigate } from "react-router-dom";
const MatchListItem: React.FC<{ match: Match }> = ({ match }) => {
  const navigate = useNavigate();
  const commentator = match.streamLinks?.[0]?.commentator;
  const commentatorName =
    typeof commentator === "object" && commentator?._id
      ? commentator.username ||
        `${commentator.firstname || ""} ${commentator.lastname || ""}`.trim() ||
        "Chưa cập nhật BLV"
      : "Chưa cập nhật BLV";
  return (
    <div
      onClick={() => {
        navigate(`/truc-tiep/${match?.slug}/${match?.sport?.slug}`);
      }}
      className="relative flex flex-wrap sm:flex-nowrap items-center justify-between cursor-pointer p-2 sm:p-3 bg-slate-800 hover:bg-slate-700/50 transition-colors duration-150 border-b border-slate-700 last:border-b-0"
    >
      {/* Time */}
      <div className="w-1/3 sm:w-1/6 text-xs sm:text-xs text-gray-300 font-medium mb-1 sm:mb-0">
        {new Date(match?.startTime ?? "").toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })}
      </div>

      {/* Team A */}
      <div className="w-1/2 sm:w-2/5 flex items-center justify-end font-semibold space-x-1 sm:space-x-2 mb-1 sm:mb-0">
        <span className="text-xs sm:text-sm text-white truncate">
          {match?.homeTeam?.name}
        </span>
        <img
          src={match?.homeTeam?.logo}
          alt={match?.homeTeam?.name}
          className="w-5 h-5 sm:w-10 sm:h-10 object-contain"
        />
      </div>

      {/* VS */}
      <div className="hidden sm:block w-1/12 text-center text-xs text-white font-bold">
        vs
      </div>
      <div className="block sm:hidden w-full text-center text-xs text-white mb-1 font-bold">
        vs
      </div>

      {/* Team B */}
      <div className="w-1/2 sm:w-2/5 flex items-center space-x-1 sm:space-x-2 justify-start mb-1 sm:mb-0 font-semibold ">
        <img
          src={match?.awayTeam?.logo}
          alt={match?.homeTeam?.name}
          className="w-5 h-5 sm:w-10 sm:h-10 object-contain"
        />
        <span className="text-xs sm:text-sm text-white text-right line-clamp-1 overflow-hidden break-words">
          {match?.awayTeam?.name}
        </span>
      </div>

      {/* Streamer */}
      <div className="w-full sm:w-1/5 flex items-center justify-end space-x-1.5 pl-0 sm:pl-2 mt-1 sm:mt-0 ">
        {match?.streamLinks?.[0]?.commentatorImage ? (
          <img
            src={match?.streamLinks?.[0]?.commentatorImage}
            alt={commentatorName}
            className="w-4 h-4 sm:w-5 sm:h-5 rounded-full"
          />
        ) : (
          <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
        )}
        <span className="text-[11px] sm:text-xs text-sky-400 truncate hover:text-sky-300 cursor-pointer">
          {commentatorName}
        </span>
      </div>

      {/* Live badge */}
      {match.status === "LIVE" && (
        <div className="w-full sm:w-1/12 flex justify-end mt-1 sm:mt-0 absolute top-0 right-0">
          <span className="text-[11px] sm:text-xs bg-red-500 text-white px-1.5 py-0.5 rounded font-semibold animate-pulse">
            LIVE
          </span>
        </div>
      )}
    </div>
  );
};

export default MatchListItem;
