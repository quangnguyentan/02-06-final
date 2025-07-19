import * as React from "react";
import { useData } from "@/context/DataContext";
import { CategorizedVideoReelGroup, VideoReels } from "@/types/videoReel.type";
import CategoryVideoReelSection from "@/components/layout/CateogoryVideoReelSection"; // Sửa typo
import { useParams } from "react-router-dom";
import ReplayCard from "@/components/layout/ReplayCard";
import { ChevronRightIcon, ChevronLeftIcon } from "@/components/layout/Icon";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import VideoReelCard from "./VideoReelCard";
export const Pagination: React.FC<{
  currentPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalItems, onPageChange }) => {
  const itemsPerPage = [12, 12, 12]; // Page 1: 8, Page 2+: 12
  let cumulativeItems = 4; // Start from index 0
  let totalPages = 1;

  for (let i = 0; cumulativeItems < totalItems; i++) {
    cumulativeItems += itemsPerPage[i] || itemsPerPage[itemsPerPage.length - 1];
    totalPages = i + 1;
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-center items-center space-x-2 my-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
        aria-label="Previous page"
      >
        &lt;
      </button>
      {pages?.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded ${
            currentPage === page
              ? "bg-yellow-400 text-black"
              : "bg-gray-700 text-white"
          }`}
          aria-label={`Page ${page}`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
        aria-label="Next page"
      >
        &gt;
      </button>
    </div>
  );
};
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
const VideoReelsHubPage: React.FC = () => {
  const { videoReelData, loading, sportData } = useData();
  const [currentPage, setCurrentPage] = React.useState(1);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { slug } = useParams<{ slug?: string }>(); // Lấy slug từ URL, mặc định undefined nếu không có

  // Lọc videoReelData theo slug trước khi nhóm
  const filteredVideoReels = React.useMemo(() => {
    if (!videoReelData || videoReelData.length === 0) return [];
    return slug
      ? videoReelData.filter((reel) => reel.sport?.slug === slug)
      : videoReelData;
  }, [videoReelData, slug]);

  // Group video reels by sport.slug
  const categorizedVideoReels = React.useMemo(() => {
    if (!filteredVideoReels || filteredVideoReels.length === 0) return [];

    const groups: CategorizedVideoReelGroup[] = [];
    const slugMap = new Map<string, VideoReels[]>(); // Sử dụng slugMap thay vì sportMap

    // Group by sport.slug or "Unknown" if sport is undefined
    filteredVideoReels.forEach((reel) => {
      const sportSlug = reel.sport?.slug || "Unknown";
      if (!slugMap.has(sportSlug)) {
        slugMap.set(sportSlug, []);
      }
      slugMap.get(sportSlug)!.push(reel);
    });

    // Convert map to CategorizedVideoReelGroup array
    slugMap.forEach((replays, sportSlug) => {
      groups.push({
        id: sportSlug,
        title: sportSlug,
        replays,
      });
    });

    // Sort groups by sport slug
    return groups.sort((a, b) => a.title.localeCompare(b.title));
  }, [filteredVideoReels]);

  // Flatten video reels for pagination
  const allVideoReels = React.useMemo(() => {
    return categorizedVideoReels.reduce(
      (acc, group) => [...acc, ...group.replays],
      [] as VideoReels[]
    );
  }, [categorizedVideoReels]);

  // Calculate start and end indices based on page
  const getPageIndices = (page: number) => {
    let startIndex = 0; // Start from index 0
    if (page === 1) {
      return { start: startIndex, end: startIndex + 12 }; // 8 items on page 1
    }
    for (let i = 2; i <= page; i++) {
      startIndex += i === 2 ? 12 : 12; // Page 1: 8, Page 2+: 12
    }
    return { start: startIndex, end: startIndex + 12 };
  };

  const { start, end } = getPageIndices(currentPage);
  const paginatedVideoReels = allVideoReels.slice(start, end);

  // Group paginated video reels back into categories
  const paginatedGroups = React.useMemo(() => {
    const grouped: CategorizedVideoReelGroup[] = [];
    const paginatedReelIds = new Set(
      paginatedVideoReels.map((reel) => reel._id)
    );
    for (const group of categorizedVideoReels) {
      const groupReplays = group.replays.filter((reel) =>
        paginatedReelIds.has(reel._id)
      );
      if (groupReplays.length > 0) {
        grouped.push({ ...group, replays: groupReplays });
      }
    }
    return grouped;
  }, [categorizedVideoReels, paginatedVideoReels]);

  React.useEffect(() => {
    if (currentPage) {
      containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage]);
  const sportFilter = React.useMemo(() => {
    if (!sportData || sportData.length === 0) return [];
    return slug ? sportData.filter((sport) => sport?.slug === slug) : sportData;
  }, [sportData, slug]);

  return (
    <div
      ref={containerRef}
      className="w-full mx-auto 
        max-w-[640px] sm:max-w-[768px] md:max-w-[960px] 
        lg:max-w-[1024px] 
        xl:max-w-[1200px] 
        2xl:max-w-[1440px] 
        3xl:max-w-[1440px]"
    >
      <main className="w-full pt-2">
        <div className="bg-slate-800 p-4 rounded-lg shadow-xl mb-4">
          <h1 className="text-xl font-bold text-yellow-400 mb-2 uppercase">
            {slug === "esports"
              ? "VIDEO LIÊN MINH THÚ VỊ"
              : `VIDEO ${sportFilter?.[0]?.name} THÚ VỊ`}
          </h1>
          <p className="text-sm text-gray-300 leading-relaxed">
            {slug === "esports"
              ? "  Xem lại các video liên minh đáng chú ý cập nhật liên tục trên HoiquanTV"
              : `Xem lại các video ${sportFilter?.[0]?.name?.toLocaleLowerCase()} đáng chú ý cập nhật liên tục trên HoiquanTV`}
          </p>
        </div>
        {loading ? (
          <div className="text-center text-white">Đang tải...</div>
        ) : paginatedGroups.length === 0 ? (
          <div className="text-center text-white">
            Không có video {sportFilter?.[0]?.name?.toLowerCase()} đáng chú ý
            nào!
          </div>
        ) : (
          <>
            <div>
              {/* Mobile view: Horizontal scroll */}
              <div className="block lg:hidden">
                <div className="flex overflow-x-auto space-x-3 sm:space-x-4 pb-3 sm:pb-4 -mx-1 sm:-mx-4 px-1 sm:px-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                  {videoReelData?.map((videoReel) => (
                    <div
                      key={videoReel?._id}
                      className="flex-shrink-0 w-[70%] sm:w-[45%] md:w-[30%] h-[600px]"
                    >
                      <VideoReelCard reel={videoReel} />
                    </div>
                  ))}
                  <div className="flex-shrink-0 w-px"></div>
                </div>
              </div>
              {/* Desktop view: Slick Slider */}
            </div>
            {paginatedGroups.map((group) => (
              <CategoryVideoReelSection key={group.id} group={group} />
            ))}
            <Pagination
              currentPage={currentPage}
              totalItems={allVideoReels.length}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default VideoReelsHubPage;
