import ReplayHubPage from "@/components/layout/ReplayHubPage";
import { useData } from "@/context/DataContext";
import * as React from "react";
import { FootballIcon } from "@/components/layout/Icon";
import { HighlightedEventInfo, type Replay } from "@/types/replay.types";
import { useParams } from "react-router-dom";
import { Loader } from "@/components/layout/Loader";

const Replay: React.FC = () => {
  const { replayData, loading, error, initialLoadComplete } = useData();
  const { slug } = useParams();

  const replaySuggestions = React.useMemo(
    () => (replayData || []).filter((r) => r.sport?.slug === slug && r.isShown),
    [replayData, slug]
  );

  const featuredBroadcasts = React.useMemo(() => {
    return replaySuggestions.map((replay) => ({
      id: replay._id ?? "",
      playerImage: replay.match?.homeTeam?.logo || "",
      playerName: replay.match?.homeTeam?.name || "",
      time:
        new Date(replay.publishDate || "").toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }) + " ---",
      opponentName: replay.match?.awayTeam?.name || "",
      commentator: replay.commentator || "",
    }));
  }, [replaySuggestions]);

  const highlightedEvent = React.useMemo<HighlightedEventInfo | null>(() => {
    const replay = replaySuggestions[0];
    if (!replay) return null;
    return {
      playerImages: [
        replay.match?.homeTeam?.logo ?? "",
        replay.match?.awayTeam?.logo ?? "",
        replay.thumbnail ?? "",
      ],
      replay,
      description: `${replay?.title}`,
      commentatorInfo: `${replay.commentator} | ${new Date(
        replay.publishDate || ""
      ).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
      })}`,
      dateDisplay: new Date(replay.publishDate || "").toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "2-digit",
        }
      ),
    };
  }, [replaySuggestions]);

  const categorizedReplays = React.useMemo(() => {
    const categories: { [key: string]: Replay[] } = {};
    replaySuggestions.forEach((replay) => {
      const sportName = replay.sport?.name || "Uncategorized";
      if (!categories[sportName]) {
        categories[sportName] = [];
      }
      categories[sportName].push(replay);
    });

    return Object.entries(categories).map(([title, replays]) => ({
      id: title.toLowerCase().replace(/\s+/g, "-"),
      title,
      icon: <FootballIcon className="w-5 h-5 text-green-400" />,
      replays,
      viewAllUrl: "#",
    }));
  }, [replaySuggestions]);

  if (loading && !initialLoadComplete && !replayData?.length) return <Loader />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ReplayHubPage
      featuredBroadcasts={featuredBroadcasts}
      highlightedEvent={highlightedEvent || undefined}
      categorizedReplays={categorizedReplays}
      sidebarReplays={replaySuggestions}
    />
  );
};

export default Replay;
