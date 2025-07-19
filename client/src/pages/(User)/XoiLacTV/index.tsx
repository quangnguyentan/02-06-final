import XoilacTvPage from "@/components/layout/XoilacTvPage";
import { useData } from "@/context/DataContext";
import { MatchStatusType } from "@/types/match.types";
import * as React from "react";
import { adjustToVietnamTime, formatDate } from "@/lib/helper";

const XoiLacTV: React.FC = () => {
  const { matchData, loading, error } = useData();
  const today = React.useMemo(() => new Date(), []);

  const filterMatchesBySport = React.useCallback(
    (slug: string) => {
      return (matchData || []).filter((match) => {
        if (!match?.startTime) return false;
        const matchDate = adjustToVietnamTime(new Date(match.startTime));
        const matchDay = formatDate(matchDate);
        const todayDay = formatDate(today);
        return (
          match?.sport?.slug === slug &&
          match?.status !== MatchStatusType.FINISHED &&
          match?.status !== MatchStatusType.CANCELLED &&
          matchDay === todayDay
        );
      });
    },
    [matchData, today]
  );

  const spotlightMatches = React.useMemo(
    () =>
      (matchData || []).filter((match) => {
        if (!match?.startTime) return false;
        const matchDate = adjustToVietnamTime(new Date(match.startTime));
        const matchDay = formatDate(matchDate);
        const todayDay = formatDate(today);
        return (
          match?.isHot &&
          match?.status !== MatchStatusType.FINISHED &&
          match?.status !== MatchStatusType.CANCELLED &&
          matchDay === todayDay
        );
      }),
    [matchData, today]
  );

  const footballMatches = React.useMemo(
    () => filterMatchesBySport("football"),
    [filterMatchesBySport]
  );
  const tennisMatches = React.useMemo(
    () => filterMatchesBySport("tennis"),
    [filterMatchesBySport]
  );
  const basketballMatches = React.useMemo(
    () => filterMatchesBySport("basketball"),
    [filterMatchesBySport]
  );
  const volleyballMatches = React.useMemo(
    () => filterMatchesBySport("volleyball"),
    [filterMatchesBySport]
  );

  if (loading && !matchData?.length) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <XoilacTvPage
      spotlightMatches={spotlightMatches}
      footballMatches={footballMatches}
      tennisMatches={tennisMatches}
      basketballMatches={basketballMatches}
      volleyballMatches={volleyballMatches}
    />
  );
};

export default XoiLacTV;
