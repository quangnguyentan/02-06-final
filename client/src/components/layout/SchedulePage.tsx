import { useState, useMemo } from "react";
import DateSelector from "@/components/layout/DateSelector";
import MatchList from "@/components/layout/MatchList";
import ReplaySuggestionsPanel from "@/components/layout/ReplaySuggestionsPanel";
import { DateTabInfo, LeagueSchedule } from "@/types/match.types";
import { HomeIconSolid, ChevronRightIcon } from "@/components/layout/Icon";
import * as React from "react";
import { Replay } from "@/types/replay.types";
import { capitalizeFirstLetter } from "@/lib/helper";
import { useNavigate } from "react-router-dom";
import { useSelectedPageContext } from "@/hooks/use-context";
import { Banner } from "@/types/banner.types";
import { useData } from "@/context/DataContext";
import VideoReelsHubPage from "./VideoReelHubPage";

interface SchedulePageProps {
  isHideBreadcrumbs?: boolean;
  availableDates: DateTabInfo[];
  initialSelectedDateId: string;
  scheduleData: { [dateId: string]: LeagueSchedule[] };
  replayItems: Replay[];
}

const ScheduleBreadcrumbs: React.FC = () => {
  const nameSlug = localStorage.getItem("selectedSportsNavbarPage");
  const navigate = useNavigate();
  const { setSelectedSportsNavbarPage, setSelectedPage } =
    useSelectedPageContext();
  return (
    <nav
      className="text-xs text-gray-400 mb-3 px-2 flex items-center space-x-1.5"
      aria-label="Breadcrumb"
    >
      <div
        onClick={() => {
          localStorage.removeItem("selectedSportsNavbarPage");
          setSelectedSportsNavbarPage("");
          localStorage.setItem("selectedPage", "TRANG CHỦ");
          setSelectedPage("TRANG CHỦ");
          navigate("/"); // Navigate to homepage
        }}
        className="hover:text-yellow-400 flex items-center text-xs text-white hover:text-xs cursor-pointer"
      >
        <HomeIconSolid className="w-3.5 h-3.5 mr-1" /> Trang chủ
      </div>
      <ChevronRightIcon className="w-3 h-3 text-gray-500" />
      <span className="text-gray-200 font-medium">Lịch Thi Đấu {nameSlug}</span>
    </nav>
  );
};

const SchedulePage: React.FC<SchedulePageProps> = ({
  isHideBreadcrumbs,
  availableDates,
  initialSelectedDateId,
  scheduleData,
  replayItems,
}) => {
  const [selectedDateId, setSelectedDateId] = useState<string>(
    initialSelectedDateId
  );
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
  const currentMatches = useMemo(() => {
    return scheduleData[selectedDateId] || [];
  }, [selectedDateId, scheduleData]);
  const nameSlug = localStorage.getItem("selectedSportsNavbarPage");
  const selectedDateTab = useMemo(() => {
    return availableDates.find((d) => d.id === selectedDateId);
  }, [selectedDateId, availableDates]);
  const pageTitle = `Lịch Thi Đấu ${nameSlug} ${
    selectedDateTab?.dateSuffix || ""
  } Cập Nhật Mới Nhất 24H - Hội Quán TV`;
  const pageDescription = `Lịch trực tiếp ${nameSlug} ${
    selectedDateTab?.dateSuffix || ""
  } mới nhất được HoiQuanTV cập nhật liên tục 24h. Các fan hâm mộ có thể theo dõi nhiều hơn nữa BXH các giải đấu cho tới giải to trên toàn thế giới tại HoiQuanTV.`;
  return (
    <div
      className="w-full mx-auto 
        max-w-[640px] sm:max-w-[768px] md:max-w-[960px] 
        lg:max-w-[1024px] 
        xl:max-w-[1200px] 
        2xl:max-w-[1440px] 
        3xl:max-w-[1440px]"
    >
      <main className="w-full py-2">
        {isHideBreadcrumbs ? null : <ScheduleBreadcrumbs />}

        <div className="flex flex-col lg:flex-row">
          {/* Left Column: Date Selector + Match List */}
          <div className="w-full lg:w-3/4 px-2 flex-shrink-0">
            <div className="p-3 sm:p-4 rounded-lg mb-4">
              <h1 className="text-lg sm:text-xl font-bold text-blue-400 mb-1">
                {capitalizeFirstLetter(pageTitle)}
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {capitalizeFirstLetter(pageDescription)}
              </p>
            </div>
            <DateSelector
              dates={availableDates}
              selectedDateId={selectedDateId}
              onSelectDate={setSelectedDateId}
            />
            <MatchList
              leagues={currentMatches}
              selectedDateLabel={selectedDateTab?.label || "ngày này"}
            />
          </div>

          {/* Right Column: Replay Suggestions */}
          <div className="w-full lg:w-1/4 flex-shrink-0 mt-4 lg:mt-0">
            <div>
              <ReplaySuggestionsPanel
                replays={replayItems}
                title={`XEM LẠI ${replayItems[0]?.sport?.name?.toUpperCase()}`}
                titleHidden
              />
            </div>
          </div>
        </div>
        {activeBanners?.length > 0 && (
          <div className="py-3 flex items-center">
            <img
              src={filterBanners("BOTTOM", "SHEDULE_PAGE")?.imageUrl}
              alt="Small Ad Banner"
              className="w-full h-full md:h-[80px] object-cover rounded-md shadow "
            />
            <img
              src={filterBanners("BOTTOM", "SHEDULE_PAGE")?.imageUrl}
              alt="Small Ad Banner"
              className="w-full h-full md:h-[80px] object-cover rounded-md shadow hidden xl:block"
            />
          </div>
        )}
        <VideoReelsHubPage />
      </main>
    </div>
  );
};

export default SchedulePage;
