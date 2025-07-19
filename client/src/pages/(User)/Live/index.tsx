import * as React from "react";
import { useParams } from "react-router-dom";
import { Match, MatchStatusType } from "@/types/match.types";
import { useData } from "@/context/DataContext";
import belt from "@/assets/user/160t1800.gif";
import { formatDate } from "@/lib/helper";
import { Loader } from "@/components/layout/Loader";
import { UserInteractionProvider } from "@/context/UserInteractionContext";
const MatchStreamPage = React.lazy(
  () => import("@/components/layout/MatchStream")
);
const VerticalAdBanner = React.lazy(
  () => import("@/components/layout/VerticalAdBanner")
);

const Live: React.FC = () => {
  const { slug, slugSport } = useParams<{ slug: string; slugSport: string }>();
  const { matchData, replayData, loading, error, initialLoadComplete } =
    useData();
  const today = React.useMemo(() => new Date(), []);
  const relatedMatches = React.useMemo(
    () =>
      (matchData || []).filter((m) => {
        if (!m?.startTime) return false;
        const matchDate = new Date(m.startTime);
        const matchDay = formatDate(matchDate);
        const todayDay = formatDate(today);
        return (
          m?.sport?.slug === slugSport &&
          m?.slug !== slug &&
          m?.status !== MatchStatusType.FINISHED &&
          m?.status !== MatchStatusType.CANCELLED &&
          matchDay === todayDay
        );
      }),
    [matchData, slugSport, slug, today]
  );

  const replaySuggestions = React.useMemo(
    () =>
      (replayData || []).filter((replay) => replay?.sport?.slug === slugSport),
    [replayData, slugSport]
  );

  const currentMatch = React.useMemo(
    () => matchData?.find((m) => m?.slug === slug) || null,
    [matchData, slug]
  );

  if (loading && !initialLoadComplete && !matchData?.length) return <Loader />;
  if (error) return <div>Error: {error.message}</div>;
  if (!currentMatch) return <div>No match found</div>;

  return (
    <React.Suspense fallback={<Loader />}>
      <UserInteractionProvider>
        <div className="flex">
          <VerticalAdBanner position="left" imageUrl={belt} />
          <MatchStreamPage
            match={currentMatch}
            relatedMatches={relatedMatches}
            replaySuggestions={replaySuggestions}
            autoPlay={true}
          />
          <VerticalAdBanner position="right" imageUrl={belt} />
        </div>
      </UserInteractionProvider>
    </React.Suspense>
  );
};

export default Live;
