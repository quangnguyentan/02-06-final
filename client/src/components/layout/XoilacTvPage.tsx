import HeroSection from "@/components/layout/HeroSection";
import SportSection from "@/components/layout/SportSection";
import {
  HomeIconSolid,
  ChevronRightIcon,
  StarIcon,
  FootballIcon,
  TennisIcon,
  BasketballIcon,
  VolleyballIcon,
} from "@/components/layout/Icon";
import * as React from "react";
import { Match } from "@/types/match.types";
import belt_bottom_top from "@/assets/user/1330t190.gif";

interface XoilacTvPageProps {
  spotlightMatches: Match[];
  footballMatches: Match[];
  tennisMatches: Match[];
  basketballMatches: Match[];
  volleyballMatches: Match[];
}

const XoilacTvBreadcrumbs: React.FC = () => (
  <nav
    className="text-xs text-gray-400 mb-3 px-1 flex items-center space-x-1.5 pt-2"
    aria-label="Breadcrumb"
  >
    <a href="#" className="hover:text-yellow-400 flex items-center">
      <HomeIconSolid className="w-3.5 h-3.5 mr-1" /> Trang chủ
    </a>
    <ChevronRightIcon className="w-3 h-3 text-gray-500" />
    <span className="text-gray-200 font-medium">Xoilac.TV</span>
  </nav>
);

const XoilacTvPage: React.FC<XoilacTvPageProps> = ({
  spotlightMatches,
  footballMatches,
  tennisMatches,
  basketballMatches,
  volleyballMatches,
}) => {
  const introText =
    "XOILAC TV xem trực tiếp bóng đá online nhanh nhất. Xem XoilacTV là kênh cập nhật link xem trực tiếp bóng đá, bóng chuyền, bóng rổ và các môn Thể thao khác cho Fan hâm mộ Việt Nam và Quốc tế với tốc độ Internet. Xem thể thao trực tuyến với tiền thân Xoilac TV chất lượng cao không giật lag.";
  const titleText =
    "HOIQUAN TV xem trực tiếp bóng đá, bóng rổ, bóng chuyền, tennis online nhanh nhất - Hội Quán TV";
  return (
    <>
      <HeroSection />

      <main
        className="w-full mx-auto 
        max-w-[640px] sm:max-w-[768px] md:max-w-[960px] 
        lg:max-w-[1024px] 
        xl:max-w-[1200px] 
        2xl:max-w-[1440px] 
        3xl:max-w-[1440px]"
      >
        {/* Margin to avoid overlap with side ads */}
        <XoilacTvBreadcrumbs />
        <div className="px-4 rounded-lg shadow text-center space-y-4 mt-1">
          <p className="text-sm sm:text-lg md:text-xl text-gray-200 font-semibold  mx-auto drop-shadow">
            {titleText}
          </p>
          <p className="text-sm text-gray-300 leading-relaxed">{introText}</p>
        </div>
        <div className="px-1 sm:px-4 md:px-6">
          <img
            src={belt_bottom_top}
            alt="Ad Banner"
            className="object-cover md:w-full "
          />
        </div>
        <SportSection
          title="TÂM ĐIỂM THỂ THAO"
          icon={<StarIcon className="w-5 h-5 text-yellow-400" />}
          matches={spotlightMatches}
          isSpotlight={true}
          titleClassName="text-lg md:text-xl font-bold text-yellow-400 uppercase"
        />
        <div className="px-1 sm:px-4 md:px-6">
          <img
            src={belt_bottom_top}
            alt="Ad Banner"
            className="object-cover md:w-full "
          />
        </div>
        <SportSection
          title="BÓNG ĐÁ"
          icon={<FootballIcon className="w-5 h-5 text-green-400" />}
          matches={footballMatches}
          viewAllUrl="#"
        />
        <div className="px-1 sm:px-4 md:px-6">
          <img
            src={belt_bottom_top}
            alt="Ad Banner"
            className="object-cover md:w-full "
          />
        </div>
        <SportSection
          title="TENNIS"
          icon={<TennisIcon className="w-5 h-5 text-lime-400" />}
          matches={tennisMatches}
          viewAllUrl="#"
        />
        <div className="px-1 sm:px-4 md:px-6">
          <img
            src={belt_bottom_top}
            alt="Ad Banner"
            className="object-cover md:w-full "
          />
        </div>
        <SportSection
          title="BÓNG RỔ"
          icon={<BasketballIcon className="w-5 h-5 text-orange-400" />}
          matches={basketballMatches}
          viewAllUrl="#"
        />
        <div className="px-1 sm:px-4 md:px-6">
          <img
            src={belt_bottom_top}
            alt="Ad Banner"
            className="object-cover md:w-full "
          />
        </div>
        <SportSection
          title="BÓNG CHUYỀN"
          icon={<VolleyballIcon className="w-5 h-5 text-sky-400" />}
          matches={volleyballMatches}
          viewAllUrl="#"
        />
        <div className="px-1 sm:px-4 md:px-6">
          <img
            src={belt_bottom_top}
            alt="Ad Banner"
            className="object-cover md:w-full "
          />
        </div>
      </main>
    </>
  );
};

export default XoilacTvPage;
