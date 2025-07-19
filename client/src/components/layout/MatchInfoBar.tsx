import { Match } from "@/types/match.types";
import { InformationCircleIconSolid } from "./Icon";
import * as React from "react";

interface MatchInfoBarProps {
  match: Match;
}

const MatchInfoBar: React.FC<MatchInfoBarProps> = ({ match }) => {
  const commentator = match.streamLinks?.[0]?.commentator;
  const commentatorName =
    typeof commentator === "object" && commentator?._id
      ? commentator.username ||
        `${commentator.firstname || ""} ${commentator.lastname || ""}`.trim() ||
        "Unknown Commentator"
      : "Unknown Commentator";
  return (
    <div className="bg-slate-800 p-3 my-1 rounded-lg shadow">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="mb-2 sm:mb-0">
          <div className="flex items-center text-xs text-gray-400 mb-1">
            <InformationCircleIconSolid className="w-4 h-4 mr-1 text-sky-400" />
            <span>{`Trận đấu: ${match?.title}`}</span>
          </div>
          <div className="text-sm text-gray-500">
            <span>
              Thời gian:{" "}
              <span className="text-gray-300 text-xs">
                {new Date(match?.startTime ?? "").toLocaleString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                })}
              </span>
            </span>
            <span className="mx-2 text-gray-600">|</span>
            <span>
              Giải đấu:{" "}
              <span className="text-gray-300">{match?.league?.name}</span>
            </span>
          </div>
        </div>
        <a
          // href={match.betUrl || "#"}
          className="bg-yellow-500 hover:bg-yellow-600 !text-xs cursor-pointer  text-slate-900 font-medium py-2 px-4 rounded shadow-md whitespace-nowrap transition-colors self-start sm:self-center"
        >
          CƯỢC UY TÍN 100%
        </a>
      </div>
      {/* {match?.streamLinks?.[0]?.commentator && (
        <div className="mt-2 pt-2 border-t border-slate-700 flex items-center text-xs text-gray-400">
          {match?.streamLinks?.[0]?.commentatorImage && (
            <img
              src={match?.streamLinks?.[0]?.commentatorImage}
              alt={commentatorName}
              className="w-5 h-5 rounded-full mr-1.5"
            />
          )}
        </div>
      )} */}
    </div>
  );
};

export default MatchInfoBar;
