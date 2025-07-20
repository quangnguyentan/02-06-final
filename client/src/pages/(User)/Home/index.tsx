import * as React from "react";
import { DataProvider, useData } from "@/context/DataContext";
import { Match, MatchStatusType } from "@/types/match.types";
import { Suspense } from "react";
import { adjustToVietnamTime } from "@/lib/helper";
import { EventsIcon } from "@/components/layout/Icon";
import { Loader } from "@/components/layout/Loader";
import { Banner } from "@/types/banner.types";

const HeroSection = React.lazy(() => import("@/components/layout/HeroSection"));
const SportSection = React.lazy(
  () => import("@/components/layout/SportSection")
);
const ReplaySection = React.lazy(
  () => import("@/components/layout/ReplaySection")
);

const sportIconMap: Record<string, React.ReactNode> = {
  esports: "🎮",
  pool: "🎱",
  volleyball: "🏐",
  tennis: "🎾",
  basketball: "🏀",
  race: "🏎️",
  wwe: "🤼",
  football: "⚽",
  badminton: "🏸",
};

const AppContent: React.FC = () => {
  const {
    matchData,
    replayData,
    sportData,
    bannerData,
    loading,
    error,
    initialLoadComplete,
  } = useData();
  const today = React.useMemo(() => new Date(), []);
  const vietnamToday = React.useMemo(() => adjustToVietnamTime(today), [today]);
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
          filterBanners("TOP", "HOME_PAGE")?.imageUrl &&
          filterBanners("BOTTOM", "HOME_PAGE")?.imageUrl &&
          filterBanners("INLINE", "HOME_PAGE")?.imageUrl
      ) || []
    );
  }, [bannerData]);
  const filterMatchesBySport = React.useCallback(
    (slug: string) => {
      return (matchData || []).filter((match) => {
        if (!match?.startTime) return false;
        const matchDate = adjustToVietnamTime(new Date(match.startTime));
        // const matchDay = formatDate(matchDate);
        // const todayDay = formatDate(vietnamToday);
        const now = vietnamToday;
        const durationHours = match.sport?.name === "eSports" ? 6 : 6;
        const matchEndTime = new Date(
          matchDate.getTime() + durationHours * 60 * 60 * 1000
        );
        const isOngoing =
          match.status === MatchStatusType.LIVE ? now <= matchEndTime : true;
        return (
          match?.sport?.slug === slug &&
          match?.status !== MatchStatusType.FINISHED &&
          match?.status !== MatchStatusType.CANCELLED &&
          isOngoing
        );
      });
    },
    [matchData, vietnamToday]
  );
  const sportMatches = React.useMemo(() => {
    return (sportData || []).reduce(
      (acc, sport) => ({
        ...acc,
        [sport.slug ?? ""]: filterMatchesBySport(sport.slug ?? ""),
      }),
      {} as Record<string, typeof matchData>
    );
  }, [sportData, filterMatchesBySport]);

  const spotlightMatches = React.useMemo(() => {
    return (matchData || []).filter((match) => {
      if (!match?.startTime) return false;
      const matchDate = adjustToVietnamTime(new Date(match.startTime));
      // const matchDay = formatDate(matchDate);
      // const todayDay = formatDate(vietnamToday);
      const now = vietnamToday;
      const durationHours = match.sport?.name === "eSports" ? 6 : 6;
      const matchEndTime = new Date(
        matchDate.getTime() + durationHours * 60 * 60 * 1000
      );
      const isOngoing =
        match.status === MatchStatusType.LIVE ? now <= matchEndTime : true;
      return (
        match?.isHot &&
        match?.status !== MatchStatusType.FINISHED &&
        match?.status !== MatchStatusType.CANCELLED &&
        isOngoing
      );
    });
  }, [matchData, vietnamToday]);

  const replayFilter = React.useMemo(() => {
    return (replayData || []).filter((match) => match?.isShown);
  }, [replayData]);

  if (loading && !initialLoadComplete && !sportData?.length) {
    return <Loader />;
  }
  if (error) return <div>Error: {error.message}</div>;

  return (
    <Suspense fallback={<Loader />}>
      <HeroSection />
      <div className="hidden md:flex flex-col items-center justify-center gap-2 py-4 overflow-x-auto">
        <span className="text-center text-white text-sm md:text-lg md:font-semibold">
          HOIQUANTV xem trực tiếp eSports, bóng đá, bóng rổ, bóng chuyền, tennis
          online nhanh nhất - Hội Quán TV
        </span>
        <span className="text-center text-white text-sm md:text-sm">
          HoiQuanTV là kênh cập nhật link xem trực tiếp eSports, bóng đá, bóng
          chuyền, bóng rổ và các môn thể thao khác cho Fan hâm mộ Việt Nam và
          Quốc tế qua kết nối Internet. Xem thể thao trực tuyến với trên
          HoiQuanTV
        </span>
      </div>
      <div className="flex md:hidden items-center gap-2 py-4 overflow-x-auto scrollable-x w-full">
        <span className="text-center text-white text-sm font-semibold flex-shrink-0">
          HOIQUANTV xem trực tiếp eSports, bóng đá, bóng rổ, bóng chuyền, tennis
          online nhanh nhất - Hội Quán TV. HoiQuanTV là kênh cập nhật link xem
          trực tiếp bóng đá, bóng chuyền, bóng rổ và các môn thể thao khác cho
          Fan hâm mộ Việt Nam và Quốc tế qua kết nối Internet. Xem thể thao trực
          tuyến với trên HoiQuanTV
        </span>
      </div>
      <main className="w-full mx-auto max-w-[640px] sm:max-w-[768px] md:max-w-[960px] lg:max-w-[1024px] xl:max-w-[1200px] 2xl:max-w-[1440px] 3xl:max-w-[1440px]">
        {activeBanners?.length > 0 && (
          <div className="flex items-center">
            <img
              src={filterBanners("TOP", "HOME_PAGE")?.imageUrl}
              alt="Ad Banner"
              className="object-cover md:w-full w-full h-full md:h-[80px]"
            />
            <img
              src={filterBanners("TOP", "HOME_PAGE")?.imageUrl}
              alt="Ad Banner"
              className="object-cover w-full hidden xl:block h-full md:h-[80px]"
            />
          </div>
        )}

        <SportSection
          title="TÂM ĐIỂM THỂ THAO"
          icon={sportIconMap["events"] || <EventsIcon className="w-6 h-6" />}
          matches={spotlightMatches}
          isSpotlight
        />
        {activeBanners?.length > 0 && (
          <div className="flex items-center">
            <img
              src={filterBanners("TOP", "HOME_PAGE")?.imageUrl}
              alt="Ad Banner"
              className="object-cover h-full md:h-[80px] md:w-full"
            />
            <img
              src={filterBanners("TOP", "HOME_PAGE")?.imageUrl}
              alt="Ad Banner"
              className="object-cover h-full md:h-[80px] w-full hidden xl:block"
            />
          </div>
        )}
        {sportData?.map((sport) => (
          <SportSection
            key={sport._id}
            title={sport.name ?? ""}
            icon={sportIconMap[sport.slug ?? ""] || sport.icon || null}
            matches={sportMatches[sport.slug ?? ""] || []}
            viewAllUrl="#"
          />
        ))}
        {activeBanners?.length > 0 && (
          <div className="flex items-center">
            <img
              src={filterBanners("INLINE", "HOME_PAGE")?.imageUrl}
              alt="Ad Banner"
              className="object-cover h-full md:h-[80px] md:w-full"
            />
            <img
              src={filterBanners("TOP", "HOME_PAGE")?.imageUrl}
              alt="Ad Banner"
              className="object-cover h-full md:h-[80px] w-full hidden xl:block"
            />
          </div>
        )}
        <ReplaySection
          title="XEM LẠI CÁC TRẬN ĐẤU"
          replays={replayFilter}
          viewAllUrl="#"
        />
        {activeBanners?.length > 0 && (
          <div className="flex items-center">
            <img
              src={filterBanners("BOTTOM", "HOME_PAGE")?.imageUrl}
              alt="Ad Banner"
              className="object-cover h-full md:h-[80px] md:w-full"
            />
            <img
              src={filterBanners("TOP", "HOME_PAGE")?.imageUrl}
              alt="Ad Banner"
              className="object-cover h-full md:h-[80px] w-full hidden xl:block"
            />
          </div>
        )}
      </main>
    </Suspense>
  );
};

const App: React.FC = () => {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
};

export default App;
