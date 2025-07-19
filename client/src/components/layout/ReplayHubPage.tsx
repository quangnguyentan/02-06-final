import ReplaySuggestionsPanel from "@/components/layout/ReplaySuggestionsPanel";
import FeaturedBroadcastSection from "@/components/layout/FeaturedBroadcastSection";
import CategoryReplaySection from "@/components/layout/CategoryReplaySection";
import FilterBarReplays from "@/components/layout/FilterBarReplays";
import {
  FeaturedBroadcastItem,
  HighlightedEventInfo,
  CategorizedReplayGroup,
} from "@/types/replay.types";
import { HomeIconSolid, ChevronRightIcon } from "@/components/layout/Icon";
import * as React from "react";
import { Replay } from "@/types/replay.types";
import { useSelectedPageContext } from "@/hooks/use-context";
import { useNavigate } from "react-router-dom";

interface ReplayHubPageProps {
  featuredBroadcasts?: FeaturedBroadcastItem[];
  highlightedEvent?: HighlightedEventInfo;
  categorizedReplays?: CategorizedReplayGroup[];
  sidebarReplays?: Replay[];
}

const ReplayHubBreadcrumbs: React.FC = () => {
  const navigate = useNavigate();
  const { setSelectedSportsNavbarPage, setSelectedPage } =
    useSelectedPageContext();
  return (
    <nav
      className="text-xs text-gray-400 mb-3 px-1 flex items-center space-x-1.5"
      aria-label="Breadcrumb"
    >
      <div
        onClick={() => {
          localStorage.removeItem("selectedSportsNavbarPage");
          setSelectedSportsNavbarPage("");
          localStorage.setItem("selectedPage", "TRANG CHỦ");
          setSelectedPage("TRANG CHỦ");
          navigate("/");
        }}
        className="hover:text-yellow-400 flex items-center text-xs text-white hover:text-xs cursor-pointer"
      >
        <HomeIconSolid className="w-3.5 h-3.5 mr-1" /> Trang chủ
      </div>
      <ChevronRightIcon className="w-3 h-3 text-gray-500" />
      <span className="text-gray-200 font-medium">Xem Lại</span>
    </nav>
  );
};

const Pagination: React.FC<{
  currentPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalItems, onPageChange }) => {
  const itemsPerPage = [8, 12, 12]; // Page 1: 8, Page 2+: 12
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

const ReplayHubPage: React.FC<ReplayHubPageProps> = ({
  featuredBroadcasts,
  highlightedEvent,
  categorizedReplays,
  sidebarReplays,
}) => {
  const pageTitle =
    "XEM LẠI NHỮNG TRẬN ĐẤU ĐỈNH CAO TRÊN HOIQUANTV TV MỚI NHẤT, CẬP NHẬT LIÊN TỤC";
  const pageDescription =
    "Trang Hoiquan TV cập nhật đầy đủ các video bóng đá, thể thao chất lượng nhất, được bình luận bằng tiếng Việt. Thêm vào đó còn có các tin tức thể thao mới nhất được cập nhật liên tục.";
  const [currentPage, setCurrentPage] = React.useState(1);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Flatten replays from all groups
  const allReplays = React.useMemo(() => {
    return (
      categorizedReplays?.reduce(
        (acc, group) => [...acc, ...group.replays],
        [] as Replay[]
      ) || []
    );
  }, [categorizedReplays]);
  React.useEffect(() => {
    if (currentPage) {
      containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.pathname, currentPage]);
  // Calculate start and end indices based on page
  const getPageIndices = (page: number) => {
    let startIndex = 4; // Start from index 0
    if (page === 1) {
      return { start: startIndex, end: startIndex + 8 }; // 8 items (indices 0 to 7)
    }
    for (let i = 2; i <= page; i++) {
      startIndex += i === 2 ? 8 : 12; // Page 1: 8, Page 2+: 12
    }
    return { start: startIndex, end: startIndex + 12 };
  };

  const { start, end } = getPageIndices(currentPage);
  const paginatedReplays = allReplays.slice(start, end);

  // Group paginated replays back into categories
  const paginatedGroups = React.useMemo(() => {
    const grouped: CategorizedReplayGroup[] = [];
    const paginatedReplayIds = new Set(
      paginatedReplays.map((replay) => replay._id)
    );
    for (const group of categorizedReplays || []) {
      const groupReplays = group.replays.filter((replay) =>
        paginatedReplayIds.has(replay._id)
      );
      if (groupReplays?.length > 0) {
        grouped.push({ ...group, replays: groupReplays });
      }
    }
    return grouped;
  }, [categorizedReplays, paginatedReplays]);
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
        <ReplayHubBreadcrumbs />
        <FilterBarReplays />
        <div className="bg-slate-800 p-4 rounded-lg shadow-xl mb-4">
          <h1 className="text-xl font-bold text-yellow-400 mb-2">
            {pageTitle}
          </h1>
          <p className="text-sm text-gray-300 leading-relaxed">
            {pageDescription}
          </p>
        </div>

        {currentPage === 1 ? (
          <>
            <h2 className="text-lg font-bold uppercase text-gray-100/80 py-4">
              Mới cập nhật
            </h2>
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-3/4 flex-shrink-0 pr-2">
                <div className="rounded-lg shadow-md mb-4">
                  <FeaturedBroadcastSection
                    items={featuredBroadcasts || []}
                    highlightedEvent={
                      highlightedEvent || ({} as HighlightedEventInfo)
                    }
                  />
                </div>
              </div>
              <div className="lg:w-1/4 flex-shrink-0">
                <ReplaySuggestionsPanel
                  replays={sidebarReplays || []}
                  title="XEM LẠI BÓNG ĐÁ"
                />
              </div>
            </div>
            {paginatedGroups?.map((group) => (
              <CategoryReplaySection key={group.id} group={group} />
            ))}
          </>
        ) : (
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-full flex-shrink-0 pr-2">
              {paginatedGroups?.map((group) => (
                <CategoryReplaySection key={group.id} group={group} />
              ))}
            </div>
          </div>
        )}
        <Pagination
          currentPage={currentPage}
          totalItems={allReplays.length}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </main>
    </div>
  );
};

export default ReplayHubPage;
