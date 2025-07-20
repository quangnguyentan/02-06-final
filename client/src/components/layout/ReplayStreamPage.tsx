import VideoPlayer from "@/components/layout/VideoPlayer";
import FilterBarReplays from "@/components/layout/FilterBarReplays";
import ReplaySuggestionsPanel from "@/components/layout/ReplaySuggestionsPanel";
import { CategorizedReplayGroup, Replay } from "@/types/replay.types";
import { HomeIconSolid, ChevronRightIcon } from "@/components/layout/Icon";
import * as React from "react";
import CategoryReplaySection from "./CategoryReplaySection";
import { useNavigate } from "react-router-dom";
import { useSelectedPageContext } from "@/hooks/use-context";
import { Banner } from "@/types/banner.types";
import { useData } from "@/context/DataContext";

interface ReplayStreamPageProps {
  mainReplay: Replay;
  categorizedReplays?: CategorizedReplayGroup[];
  suggestedReplays: Replay[];
}

const ReplayStreamBreadcrumbs: React.FC<{ replay: Replay }> = ({ replay }) => {
  const navigate = useNavigate();
  const { setSelectedSportsNavbarPage, setSelectedPage } =
    useSelectedPageContext();
  return (
    <nav
      className="text-xs text-gray-400 mb-2 px-1 flex items-center space-x-0.5 pt-4"
      aria-label="Breadcrumb"
    >
      <div
        onClick={() => {
          navigate("/");
          localStorage.removeItem("selectedSportsNavbarPage");
          setSelectedSportsNavbarPage("");
          localStorage.setItem("selectedPage", "TRANG CHỦ");
          setSelectedPage("TRANG CHỦ");
        }}
        className="hover:text-yellow-400 flex items-center text-xs text-white hover:text-xs cursor-pointer"
      >
        <HomeIconSolid className="w-3.5 h-3.5 mr-1" /> Trang chủ
      </div>
      <ChevronRightIcon className="w-3 h-3 text-gray-500" />
      <div
        onClick={() => {
          navigate(`/xem-lai/${replay?.sport?.slug}`);
          localStorage.setItem("selectedSportsNavbarPage", "eSports");
          setSelectedSportsNavbarPage("eSports");
        }}
        className="hover:text-yellow-400 text-xs text-white hover:text-xs cursor-pointer"
      >
        Xem lại
      </div>
      <ChevronRightIcon className="w-3 h-3 text-gray-500" />
      <div className="text-xs text-current-color hover:text-xs ">
        {replay?.sport?.name || "Thể loại"}
      </div>
      <ChevronRightIcon className="w-3 h-3 text-gray-500" />
      <span
        className="text-current-color truncate max-w-[120px] xs:max-w-[180px] sm:max-w-xs"
        title={replay?.title}
      >
        {replay?.title}
      </span>
    </nav>
  );
};

const ReplayStreamPage: React.FC<ReplayStreamPageProps> = ({
  mainReplay,
  suggestedReplays,
  categorizedReplays,
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
    return (
      bannerData?.filter(
        (b) =>
          b.isActive !== false &&
          filterBanners("FOOTER", "REPLAY_VIDEO_PAGE")?.imageUrl
      ) || []
    );
  }, [bannerData]);
  const filteredCategorizedReplays = categorizedReplays
    ? categorizedReplays?.filter((_, index) => index === 0 || index >= 4)
    : [];
  return (
    <div
      className="w-full mx-auto 
        max-w-[640px] sm:max-w-[768px] md:max-w-[960px] 
        lg:max-w-[1024px] 
        xl:max-w-[1200px] 
        2xl:max-w-[1440px] 
        3xl:max-w-[1440px]"
    >
      <ReplayStreamBreadcrumbs replay={mainReplay} />
      <FilterBarReplays currentCategory={mainReplay?.slug} />
      <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-white my-3 px-1">
        {mainReplay?.title}
      </h1>

      <div className="flex flex-col lg:flex-row xl:flex-row">
        {/* Left Column: Video Player + Ad */}
        <div className="w-full lg:w-2/3 xl:w-3/4 flex-shrink-0 pr-2">
          <VideoPlayer
            videoTitle={mainReplay?.title}
            videoUrl={mainReplay?.videoUrl}
            posterUrl={mainReplay?.thumbnail}
          />

          <div className="rounded-md text-xs font-bold sm:text-sm text-white py-2">
            <p>{mainReplay?.title}</p>
          </div>
          {activeBanners?.length > 0 && (
            <div className="">
              <img
                src={filterBanners("FOOTER", "REPLAY_VIDEO_PAGE")?.imageUrl}
                alt="Ad Banner"
                className="object-cover h-full md:h-[80px] md:w-full "
              />
            </div>
          )}
        </div>

        {/* Right Column: Replay Suggestions */}
        <div className="w-full lg:w-1/3 xl:w-1/4 flex-shrink-0 mt-4 lg:mt-0">
          <div>
            <ReplaySuggestionsPanel
              replays={suggestedReplays}
              title={`XEM LẠI ${
                mainReplay?.sport?.name?.toUpperCase() || "KHÁC"
              }`}
            />
          </div>
        </div>
      </div>
      <div className="w-full">
        {filteredCategorizedReplays?.map((group) => (
          <CategoryReplaySection key={group.id} group={group} />
        ))}
      </div>
    </div>
  );
};

export default ReplayStreamPage;
