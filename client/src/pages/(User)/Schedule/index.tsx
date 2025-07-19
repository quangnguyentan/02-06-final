import SchedulePage from "@/components/layout/SchedulePage";
import { useScheduleData, formatDate } from "@/data/mockScheduleData";
import { useData } from "@/context/DataContext";
import * as React from "react";
import { useParams } from "react-router-dom";
import { Loader } from "@/components/layout/Loader";
import { MatchStatusType } from "@/types/match.types";
import { adjustToVietnamTime } from "@/lib/helper";

const Schedule: React.FC = () => {
  const today = React.useMemo(() => new Date(), []);
  const vietnamToday = React.useMemo(() => adjustToVietnamTime(today), [today]);
  const { matchData, replayData, loading, error, initialLoadComplete } =
    useData();
  const { slug } = useParams();

  const { scheduleData: mockScheduleData } = useScheduleData([]);
  const allMockMatches = React.useMemo(
    () =>
      Object.values(mockScheduleData)
        .flat()
        .flatMap((league: any) => league.matches),
    [mockScheduleData]
  );

  const currentMatch = React.useMemo(
    () =>
      (error || !matchData?.length ? allMockMatches : matchData)?.filter(
        (m) => {
          if (!m?.startTime) return false;
          const matchDate = adjustToVietnamTime(new Date(m.startTime));
          const now = vietnamToday;
          const durationHours = m?.sport?.name === "eSports" ? 6 : 3;
          const matchEndTime = new Date(
            matchDate.getTime() + durationHours * 60 * 60 * 1000
          );
          const isOngoing =
            m?.status === MatchStatusType.LIVE ? now <= matchEndTime : true;
          return isOngoing && m.sport?.slug === slug;
        }
      ),
    [matchData, error, allMockMatches, slug]
  );

  const replaySuggestions = React.useMemo(
    () =>
      error || !replayData?.length
        ? []
        : replayData?.filter((r) => r.sport?.slug === slug),
    [replayData, error, slug]
  );

  const { dateTabs, scheduleData } = useScheduleData(currentMatch);
  const initialDateId = formatDate(today);

  if (
    loading &&
    !initialLoadComplete &&
    !matchData?.length &&
    !replayData?.length
  )
    return <Loader />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <SchedulePage
      availableDates={dateTabs}
      initialSelectedDateId={initialDateId}
      scheduleData={scheduleData}
      replayItems={replaySuggestions}
    />
  );
};

export default Schedule;
