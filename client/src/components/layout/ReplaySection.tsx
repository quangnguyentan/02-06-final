import * as React from "react";
import ReplayCard from "@/components/layout/ReplayCard";
import { ChevronRightIcon, ChevronLeftIcon } from "@/components/layout/Icon";
import { Replay } from "@/types/replay.types";
import { useSelectedPageContext } from "@/hooks/use-context";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface ReplaySectionProps {
  title: string;
  replays: Replay[];
  viewAllUrl?: string;
}

const ReplaySection: React.FC<ReplaySectionProps> = ({
  title,
  replays,
  viewAllUrl,
}) => {
  const navigate = useNavigate();
  const { setSelectedPage } = useSelectedPageContext();

  if (!replays || replays.length === 0) {
    return null;
  }
  const NextArrow = (props: any) => {
    const { onClick } = props;
    return (
      <div
        className="custom-next-arrow absolute top-1/2 right-0 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 cursor-pointer"
        onClick={onClick}
      >
        <ChevronRightIcon className="w-8 h-8 text-white" />
      </div>
    );
  };

  const PreviewArrow = (props: any) => {
    const { onClick } = props;
    return (
      <div
        className="custom-preview-arrow absolute top-1/2 left-0 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 cursor-pointer"
        onClick={onClick}
      >
        <ChevronLeftIcon className="w-8 h-8 text-white" />
      </div>
    );
  };
  // Slider settings for desktop
  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 3.5,
    slidesToScroll: 1,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PreviewArrow />,
    lazyLoad: "ondemand" as "ondemand" | "progressive",
    responsive: [
      {
        breakpoint: 1280,
        settings: { slidesToShow: 2.5 },
      },
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  return (
    <section className="py-3 sm:py-4 px-1 sm:px-4 md:px-3">
      <div className="flex flex-row items-center justify-between items-start sm:items-center mb-3 sm:mb-4 gap-2">
        <h2 className="sm:text-xl md:text-2xl  text-white flex items-center !font-bold uppercase !text-xl">
          🎞️ {title}
        </h2>
        {viewAllUrl && (
          <div
            onClick={() => {
              navigate(`/xem-lai/esports`);
              localStorage.setItem("selectedPage", "XEM LẠI");
              setSelectedPage("XEM LẠI");
            }}
            className="text-xs sm:text-sm text-yellow-400 hover:text-yellow-300 flex items-center cursor-pointer"
          >
            Xem tất cả <ChevronRightIcon className="w-4 h-4 ml-1" />
          </div>
        )}
      </div>
      <div>
        {/* Mobile view: Horizontal scroll */}
        <div className="block lg:hidden">
          <div className="flex overflow-x-auto space-x-3 sm:space-x-4 pb-3 sm:pb-4 -mx-1 sm:-mx-4 px-1 sm:px-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {replays.map((replay) => (
              <div
                key={replay?._id}
                className="flex-shrink-0 w-[70%] sm:w-[45%] md:w-[30%]"
              >
                <ReplayCard replay={replay} />
              </div>
            ))}
            <div className="flex-shrink-0 w-px"></div>
          </div>
        </div>
        {/* Desktop view: Slick Slider */}
        <div className="hidden lg:block">
          <Slider {...sliderSettings} className="group !text-left relative">
            {replays.map((replay) => (
              <div key={replay?._id} className="px-1 h-full flex">
                <div className="h-full w-full">
                  <ReplayCard replay={replay} />
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
};

export default ReplaySection;
