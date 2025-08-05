import SportSection from "@/components/layout/SportSection";
import belt_bottom_top from "@/assets/user/1330t190.gif";
import { FootballIcon } from "@/components/layout/Icon";
import * as React from "react";
import SchedulePage from "@/components/layout/SchedulePage";
import { useScheduleData, formatDate } from "@/data/mockScheduleData";
import { DataProvider, useData } from "@/context/DataContext";
import { useParams } from "react-router-dom";
import { MatchStatusType } from "@/types/match.types";
import { adjustToVietnamTime } from "@/lib/helper";
import { Loader } from "@/components/layout/Loader";
import { Banner } from "@/types/banner.types";

const AppContent: React.FC = () => {
  const {
    matchData,
    replayData,
    bannerData,
    loading,
    error,
    initialLoadComplete,
  } = useData();
  const { slug } = useParams();
  const today = React.useMemo(() => new Date(), []);
  const vietnamToday = React.useMemo(() => adjustToVietnamTime(today), [today]);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const currentMatch = React.useMemo(() => {
    return (matchData || []).filter((m) => {
      if (!m?.startTime) return false;
      const matchDate = adjustToVietnamTime(new Date(m.startTime));
      // const matchDay = formatDate(matchDate);
      // const todayDay = formatDate(vietnamToday);
      const now = vietnamToday;
      const durationHours = m?.sport?.name === "eSports" ? 6 : 3;
      const matchEndTime = new Date(
        matchDate.getTime() + durationHours * 60 * 60 * 1000
      );
      const isOngoing =
        m?.status === MatchStatusType.LIVE ? now <= matchEndTime : true;
      return (
        m.sport?.slug === slug &&
        m?.status !== MatchStatusType.FINISHED &&
        m?.status !== MatchStatusType.CANCELLED &&
        isOngoing
      );
    });
  }, [matchData, slug, vietnamToday]);

  const replaySuggestions = React.useMemo(
    () => (replayData || []).filter((r) => r.sport?.slug === slug),
    [replayData, slug]
  );
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
          b.isActive !== false && filterBanners("INLINE", "HOME_PAGE")?.imageUrl
      ) || []
    );
  }, [bannerData]);
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
    <main
      className="w-full mx-auto max-w-[640px] sm:max-w-[768px] md:max-w-[960px] lg:max-w-[1024px] xl:max-w-[1200px] 2xl:max-w-[1440px] 3xl:max-w-[1440px]"
      ref={containerRef}
    >
      <div>
        <SportSection
          title={`TÂM ĐIỂM ${
            currentMatch[0]?.sport?.name?.toUpperCase() || "THỂ THAO"
          }`}
          icon={<FootballIcon className="w-6 h-6" />}
          matches={currentMatch}
          isSpotlight
        />
        {activeBanners?.length > 0 && (
          <div className="pb-4 flex items-center">
            <img
              src={filterBanners("INLINE", "HOME_PAGE")?.imageUrl}
              alt="Ad Banner"
              className="object-cover h-full md:h-[80px] md:w-full"
            />
            <img
              src={filterBanners("INLINE", "HOME_PAGE")?.imageUrl}
              alt="Ad Banner"
              className="object-cover h-full md:h-[80px] md:w-full hidden xl:block"
            />
          </div>
        )}
      </div>
      <SchedulePage
        isHideBreadcrumbs
        availableDates={dateTabs}
        initialSelectedDateId={initialDateId}
        scheduleData={scheduleData}
        replayItems={replaySuggestions}
      />
      {activeBanners?.length > 0 && (
        <div className="pb-4">
          <div className="pb-4 flex items-center">
            <img
              src={filterBanners("INLINE", "HOME_PAGE")?.imageUrl}
              alt="Ad Banner"
              className="object-cover h-full md:h-[80px] md:w-full"
            />
            <img
              src={filterBanners("INLINE", "HOME_PAGE")?.imageUrl}
              alt="Ad Banner"
              className="object-cover h-full md:h-[80px] md:w-full hidden xl:block"
            />
          </div>
        </div>
      )}
    </main>
  );
};

const SportProvider: React.FC = () => {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
};

export default SportProvider;
