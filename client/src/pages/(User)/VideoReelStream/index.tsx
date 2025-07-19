import * as React from "react";
import { useParams } from "react-router-dom";
import { useData } from "@/context/DataContext";
import VideoReelStreamPage from "@/components/layout/VideoReelStreamPage";
import { Loader } from "@/components/layout/Loader";
import { VideoReels, CategorizedVideoReelGroup } from "@/types/videoReel.type";
import { Banner } from "@/types/banner.types";
import {
  FootballIcon,
  BasketballIcon,
  TennisIcon,
  EventsIcon,
} from "@/components/layout/Icon";

const VideoReelStream: React.FC = () => {
  const { title, sportSlug } = useParams<{
    title: string;
    sportSlug?: string;
  }>();
  const { videoReelData, bannerData, loading, error, initialLoadComplete } =
    useData();

  // Match video reel by title (URL-decoded) and sportSlug (if provided)
  const currentReel = React.useMemo(() => {
    const decodedTitle = title ? decodeURIComponent(title) : "";
    return (
      (videoReelData || []).find(
        (reel) =>
          reel.title === decodedTitle &&
          (!sportSlug || reel.sport?.slug === sportSlug)
      ) || null
    );
  }, [videoReelData, title, sportSlug]);

  // Filter related video reels by sport.slug, excluding current reel
  const relatedReels = React.useMemo(() => {
    const decodedTitle = title ? decodeURIComponent(title) : "";
    return (videoReelData || []).filter(
      (reel) =>
        reel.title !== decodedTitle &&
        reel.sport?.slug === currentReel?.sport?.slug
    );
  }, [videoReelData, title, currentReel]);

  // Group related video reels by sport.name
  const categorizedReels = React.useMemo(() => {
    const categories: { [key: string]: VideoReels[] } = {};
    relatedReels.forEach((reel) => {
      const sportName = reel.sport?.name || "Khác";
      if (!categories[sportName]) {
        categories[sportName] = [];
      }
      categories[sportName].push(reel);
    });

    return Object.entries(categories).map(([sportName, replays]) => {
      let IconComponent: React.ElementType = FootballIcon;
      switch (sportName.toLowerCase()) {
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
        id: sportName.toLowerCase().replace(/\s+/g, "-"),
        title: sportName,
        icon: <IconComponent className="w-5 h-5 text-green-400" />,
        replays,
        viewAllUrl: `#`,
      };
    });
  }, [relatedReels]);

  // Fetch FOOTER banner
  const footerBanner = React.useMemo(() => {
    return bannerData
      ?.filter(
        (banner) =>
          banner.position === "BOTTOM" &&
          banner.isActive &&
          banner.displayPage === "REPLAY_VIDEO_PAGE"
      )
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))[0];
  }, [bannerData]);

  if (loading && !initialLoadComplete && !videoReelData?.length)
    return <Loader />;
  if (error) return <div>Error: {error.message}</div>;
  if (!currentReel) return <div>Không tìm thấy video</div>;

  return (
    <React.Suspense fallback={<Loader />}>
      <VideoReelStreamPage
        mainReel={currentReel}
        categorizedReels={categorizedReels}
        suggestedReels={relatedReels}
        banner={footerBanner}
      />
    </React.Suspense>
  );
};

export default VideoReelStream;
