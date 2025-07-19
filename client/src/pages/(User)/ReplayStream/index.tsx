import ReplayStreamPage from "@/components/layout/ReplayStreamPage";
import { useData } from "@/context/DataContext";
import * as React from "react";
import {
  FootballIcon,
  BasketballIcon,
  TennisIcon,
  EventsIcon,
} from "@/components/layout/Icon";
import { Loader } from "@/components/layout/Loader";
import { Replay } from "@/types/replay.types";
import { useParams } from "react-router-dom";

const ReplayStream: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { replayData, loading, error, initialLoadComplete } = useData();

  const currentReplay = React.useMemo(
    () => (replayData || []).find((r) => r.title === slug) || null,
    [replayData, slug]
  );

  const relatedReplays = React.useMemo(
    () =>
      (replayData || []).filter(
        (r) => r.title !== slug && r.sport?.slug === currentReplay?.sport?.slug
      ),
    [replayData, slug, currentReplay]
  );

  const categorizedReplays = React.useMemo(() => {
    const categories: { [key: string]: Replay[] } = {};
    relatedReplays.forEach((replay) => {
      const sportName = replay.sport?.name || "Khác";
      if (!categories[sportName]) {
        categories[sportName] = [];
      }
      categories[sportName].push(replay);
    });

    return Object.entries(categories).map(([title, replays]) => {
      let IconComponent: React.ElementType = FootballIcon;
      switch (title.toLowerCase()) {
        case "football":
          IconComponent = FootballIcon;
          break;
        case "basketball":
          IconComponent = BasketballIcon;
          break;
        case "tennis":
          IconComponent = TennisIcon;
          break;
        default:
          IconComponent = EventsIcon;
          break;
      }

      return {
        id: title.toLowerCase().replace(/\s+/g, "-"),
        title,
        icon: <IconComponent className="w-5 h-5 text-green-400" />,
        replays,
        viewAllUrl: "#",
      };
    });
  }, [relatedReplays]);

  if (loading && !initialLoadComplete && !replayData?.length) return <Loader />;
  if (error) return <div>Error: {error.message}</div>;
  if (!currentReplay) return <div>No replay found</div>;

  return (
    <React.Suspense fallback={<Loader />}>
      <ReplayStreamPage
        mainReplay={currentReplay}
        categorizedReplays={categorizedReplays}
        suggestedReplays={relatedReplays}
      />
    </React.Suspense>
  );
};

export default ReplayStream;
