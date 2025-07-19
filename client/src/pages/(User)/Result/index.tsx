import ResultsPage from "@/components/layout/ResultPage";
import { useScheduleDataForResults, formatDate } from "@/data/mockResultsData";
import { useData } from "@/context/DataContext";
import * as React from "react";
import {
  mockDateTabsForResults,
  mockResultsData,
} from "@/data/mockResultsData";
import { Match, MatchStatusType } from "@/types/match.types";
import { Replay } from "@/types/replay.types";
import { useParams } from "react-router-dom";
import { Loader } from "@/components/layout/Loader";
import { adjustToVietnamTime } from "@/lib/helper";

const Result: React.FC = () => {
  const today = React.useMemo(() => new Date(), []);
  const vietnamToday = React.useMemo(() => adjustToVietnamTime(today), [today]);
  const { matchData, replayData, loading, error, initialLoadComplete } =
    useData();
  const { slug } = useParams<{ slug: string }>();

  const currentMatchResults = React.useMemo(() => {
    // Flatten mockResultsData into a Match[] array
    const mockMatches: Match[] = Object.values(mockResultsData)
      .flat()
      .flatMap((league: any) => league.matches);

    const matchesToFilter =
      error || !matchData?.length ? mockMatches : matchData;

    return matchesToFilter?.filter((m) => {
      if (!m?.startTime) return false;
      const matchDate = adjustToVietnamTime(new Date(m.startTime));
      const now = vietnamToday;
      const durationHours = m?.sport?.name === "eSports" ? 6 : 3;
      const matchEndTime = new Date(
        matchDate.getTime() + durationHours * 60 * 60 * 1000
      );
      const isOngoing =
        m?.status === MatchStatusType.LIVE ? now <= matchEndTime : true;
      return (
        m.sport?.slug === slug &&
        isOngoing &&
        (m.status === MatchStatusType.FINISHED ||
          m.status === MatchStatusType.LIVE)
      );
    });
  }, [matchData, error, slug]);

  const replaySuggestions = React.useMemo(
    () =>
      error || !replayData?.length
        ? []
        : replayData.filter((r) => r.sport?.slug === slug),
    [replayData, error, slug]
  );

  const { dateTabs, scheduleData } =
    useScheduleDataForResults(currentMatchResults);

  const initialDateId = React.useMemo(
    () =>
      dateTabs.find((tab) => tab.isToday)?.id ||
      dateTabs[0]?.id ||
      formatDate(today),
    [dateTabs]
  );
  if (
    loading &&
    !initialLoadComplete &&
    !matchData?.length &&
    !replayData?.length
  )
    return <Loader />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ResultsPage
      availableDates={dateTabs.length > 0 ? dateTabs : mockDateTabsForResults}
      initialSelectedDateId={initialDateId}
      resultsData={scheduleData || mockResultsData}
      replayItems={replaySuggestions}
      noMatchesMessage="Không có trận nào"
    />
  );
};

export default Result;
