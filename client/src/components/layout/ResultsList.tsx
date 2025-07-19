import { LeagueSchedule, Match } from "@/types/match.types";
import ResultsListItem from "./ResultsListItem";
import { CalendarDaysIcon } from "./Icon";
import * as React from "react";

interface ResultsListProps {
  leagues: LeagueSchedule[];
  selectedDateLabel: string; // e.g., "Hôm Nay", "03/06"
  noMatchesMessage?: string; // Thêm để tùy chỉnh thông báo
}

const ResultsList: React.FC<ResultsListProps> = ({
  leagues,
  selectedDateLabel,
  noMatchesMessage = "Không có kết quả",
}) => {
  const hasMatches =
    leagues &&
    leagues.length > 0 &&
    leagues?.some((league) => league.matches.length > 0);

  return (
    <div className="bg-slate-850 rounded-b-md shadow-lg">
      {hasMatches ? (
        leagues?.map((league) => (
          <div key={league?.id} className="mb-0 last:mb-0">
            <div className="bg-blue-500/60 flex items-center p-2.5 border-b border-slate-600/50 sticky top-0 z-10">
              {league.icon && <span className="mr-2">{league.icon}</span>}
              <h3 className="text-sm font-semibold text-white tracking-wide">
                {league.name}
              </h3>
            </div>
            <div>
              {league.matches.map((match: Match) => (
                <ResultsListItem key={match?._id} match={match} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="bg-slate-800 p-6 rounded-b-md text-center text-gray-400 shadow-inner">
          <CalendarDaysIcon className="w-16 h-16 mx-auto !text-slate-700 mb-4" />
          <p className="text-lg font-semibold !text-slate-700">
            {noMatchesMessage}
          </p>
          <p className="text-sm !text-slate-700">
            Không có kết quả trận đấu nào cho {selectedDateLabel}.
          </p>
          <p className="text-sm !text-slate-700">Vui lòng chọn ngày khác.</p>
        </div>
      )}
    </div>
  );
};

export default ResultsList;
