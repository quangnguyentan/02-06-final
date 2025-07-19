import * as React from "react";
import VideoPlayer from "@/components/layout/VideoPlayer";
import FilterBarVideoReels from "@/components/layout/FilterBarVideoReels";
import VideoReelSuggestionsPanel from "@/components/layout/VideoReelSuggestionsPanel";
import VideoReelStreamBreadcrumbs from "@/components/layout/VideoReelStreamBreadcrumbs";
import CategoryVideoReelSection from "@/components/layout/CateogoryVideoReelSection";
import { VideoReels, CategorizedVideoReelGroup } from "@/types/videoReel.type";
import { Banner } from "@/types/banner.types";
import { useData } from "@/context/DataContext";

interface VideoReelStreamPageProps {
  mainReel: VideoReels;
  categorizedReels: CategorizedVideoReelGroup[];
  suggestedReels: VideoReels[];
  banner?: Banner;
}

const VideoReelStreamPage: React.FC<VideoReelStreamPageProps> = ({
  mainReel,
  categorizedReels,
  suggestedReels,
}) => {
  const { bannerData } = useData();

  const filterBanners = (
    position: Banner["position"],
    displayPage: Banner["displayPage"]
  ): Banner | undefined => {
    return bannerData
      ?.filter(
        (banner) =>
          banner.position === position &&
          banner.displayPage === displayPage &&
          banner.isActive
      )
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))[0];
  };
  const activeBanners = React.useMemo(() => {
    return bannerData?.filter((b) => b.isActive !== false) || [];
  }, [bannerData]);
  const filteredCategorizedReels = categorizedReels.filter(
    (_, index) => index === 0 || index >= 4
  );

  return (
    <div
      className="w-full mx-auto 
        max-w-[640px] sm:max-w-[768px] md:max-w-[960px] 
        lg:max-w-[1024px] 
        xl:max-w-[1200px] 
        2xl:max-w-[1440px] 
        3xl:max-w-[1440px]"
    >
      <VideoReelStreamBreadcrumbs reel={mainReel} />
      <FilterBarVideoReels currentCategory={mainReel?.sport?.name} />
      <div className="flex flex-col lg:flex-row">
        <div className="w-full lg:w-full xl:w-3/4 flex-shrink-0">
          <VideoPlayer
            videoTitle={mainReel?.title}
            videoUrl={mainReel?.videoUrl}
            posterUrl={mainReel?.thumbnail}
          />
          <div className="rounded-md text-xs font-bold sm:text-sm text-white py-2">
            <p>{mainReel?.title}</p>
          </div>
          {activeBanners?.length > 0 && (
            <div className="">
              <img
                src={filterBanners("FOOTER", "REPLAY_VIDEO_PAGE")?.imageUrl}
                alt="Ad Banner"
                className="object-cover md:w-full "
              />
            </div>
          )}
        </div>
        <div className="w-full lg:w-1/3 xl:w-1/4 flex-shrink-0 mt-4 lg:mt-0">
          <VideoReelSuggestionsPanel
            reels={suggestedReels}
            title={`THƯỚC PHIM  ${
              mainReel?.sport?.name?.toUpperCase() || "KHÁC"
            }`}
          />
        </div>
      </div>
      <div className="w-full">
        {filteredCategorizedReels.map((group) => (
          <CategoryVideoReelSection key={group.id} group={group} />
        ))}
      </div>
    </div>
  );
};

export default VideoReelStreamPage;
