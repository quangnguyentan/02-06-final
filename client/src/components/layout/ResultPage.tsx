import { useState, useMemo } from "react";
import DateSelector from "@/components/layout/DateSelector";
import ResultsList from "@/components/layout/ResultsList";
import ReplaySuggestionsPanel from "@/components/layout/ReplaySuggestionsPanel";
import { DateTabInfo, LeagueSchedule } from "@/types/match.types";
import { HomeIconSolid, ChevronRightIcon } from "@/components/layout/Icon";
import * as React from "react";
import { Replay } from "@/types/replay.types";
import { useNavigate } from "react-router-dom";
import { useSelectedPageContext } from "@/hooks/use-context";
import { Banner } from "@/types/banner.types";
import { useData } from "@/context/DataContext";
import VideoReelsHubPage from "./VideoReelHubPage";

interface ResultsPageProps {
  availableDates: DateTabInfo[];
  initialSelectedDateId: string;
  resultsData: { [dateId: string]: LeagueSchedule[] }; // All results data keyed by dateId
  replayItems: Replay[];
  noMatchesMessage?: string;
}

const ResultsBreadcrumbs: React.FC = () => {
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
      <span className="text-gray-200 font-medium">Kết Quả {nameSlug}</span>
    </nav>
  );
};

const ResultsPage: React.FC<ResultsPageProps> = ({
  availableDates,
  initialSelectedDateId,
  resultsData,
  replayItems,
  noMatchesMessage = "Không có trận nào",
}) => {
  const nameSlug = localStorage.getItem("selectedSportsNavbarPage");

  const [selectedDateId, setSelectedDateId] = useState<string>(
    initialSelectedDateId
  );

  const currentResults = useMemo(() => {
    return resultsData[selectedDateId] || [];
  }, [selectedDateId, resultsData]);

  const selectedDateTab = useMemo(() => {
    return availableDates.find((d) => d.id === selectedDateId);
  }, [selectedDateId, availableDates]);
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
  const pageTitleDate = selectedDateTab?.isToday
    ? "HÔM NAY"
    : selectedDateTab?.dateSuffix;
  const pageTitle = `HOIQUAN TV: KẾT QUẢ ${nameSlug} ${
    pageTitleDate ? pageTitleDate : ""
  } CẬP NHẬT MỚI NHẤT 24H`;
  const pageDescription = `Kết quả ${nameSlug} ${
    pageTitleDate ? pageTitleDate : ""
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
        <ResultsBreadcrumbs />
        <div className="flex flex-col lg:flex-row">
          {/* Left Column: Date Selector + Results List */}
          <div className="lg:w-3/4 flex-shrink-0 px-2">
            <div className="p-4 rounded-lg mb-4">
              <h1 className="text-base md:text-xl font-bold text-blue-400 mb-1">
                {pageTitle}
              </h1>
              <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
                {pageDescription}
              </p>
            </div>
            <DateSelector
              dates={availableDates}
              selectedDateId={selectedDateId}
              onSelectDate={setSelectedDateId}
              activeTabStyle="results" // Use a specific style for results page
            />
            <ResultsList
              leagues={currentResults}
              selectedDateLabel={selectedDateTab?.label || "ngày này"}
              noMatchesMessage={noMatchesMessage}
            />
          </div>

          {/* Right Column: Replay Suggestions + Ad */}
          <div className="lg:w-1/4 flex-shrink-0">
            <div>
              <ReplaySuggestionsPanel
                replays={replayItems}
                title="XEM LẠI BÓNG ĐÁ"
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
              className="w-full h-full md:h-[80px] object-cover rounded-md shadow"
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

export default ResultsPage;
