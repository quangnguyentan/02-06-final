import { LeagueSchedule, Match } from "@/types/match.types";
import { CalendarDaysIcon } from "./Icon"; // For streamer avatar fallback
import * as React from "react";
import MatchListItem from "./MatchListItem";
interface MatchListProps {
  leagues: LeagueSchedule[];
  selectedDateLabel: string;
}

const MatchList: React.FC<MatchListProps> = (props: MatchListProps) => {
  const { leagues, selectedDateLabel } = props;

  if (!leagues || leagues.length === 0) {
    return (
      <div className="bg-slate-800 p-6 rounded-b-md text-center text-gray-400">
        <CalendarDaysIcon className="w-16 h-16 mx-auto text-slate-700 mb-4" />
        <p className="text-lg font-semibold !text-slate-700">
          Không có lịch thi đấu
        </p>
        <p className="text-sm !text-slate-700">
          Không có trận đấu nào được lên lịch cho {selectedDateLabel}.
        </p>
        <p className="text-sm !text-slate-700">Vui lòng chọn ngày khác.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-850 rounded-b-md flex flex-col gap-4 py-4">
      {leagues?.map((league) => (
        <div key={league.id} className="mb-0 last:mb-0">
          <div className="bg-blue-500/60 flex items-center p-2.5 border-b border-slate-600 sticky top-0 z-10">
            {/* Sticky header for league */}
            {league.icon && <span className="mr-2">{league.icon}</span>}
            <h3 className="text-sm font-semibold text-white">{league.name}</h3>
          </div>
          <div className="divide-y divide-slate-750 ">
            {league.matches.map(
              (
                match: Match // Explicitly typing 'match' here for clarity
              ) => (
                <MatchListItem key={match?._id} match={match} />
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MatchList;
