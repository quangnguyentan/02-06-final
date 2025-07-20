import VideoPlayer from "@/components/layout/VideoPlayer";
import MatchInfoBar from "@/components/layout/MatchInfoBar";
import ReplaySuggestionsPanel from "@/components/layout/ReplaySuggestionsPanel";
import SportSection from "@/components/layout/SportSection";
import { HomeIconSolid, ChevronRightIcon } from "@/components/layout/Icon";
import * as React from "react";
import { Match } from "@/types/match.types";
import { Replay } from "@/types/replay.types";
import { useSelectedPageContext } from "@/hooks/use-context";
import { useLocation, useNavigate } from "react-router-dom";
import wait_football from "@/assets/user/wait_football.webp";
import { useMediaQuery, useTheme } from "@mui/material";
import { useData } from "@/context/DataContext";
import { Banner } from "@/types/banner.types";
import {
  ChatBubbleLeftRightIcon,
  ChatBubbleOvalLeftIcon,
} from "@heroicons/react/24/solid";
import briefcase from "@/assets/user/briefcase.png";
import ChatPanel from "./ChatPanel";
import FooterInfo from "../footer";
import Player from "./Player";
interface MatchStreamPageProps {
  match: Match;
  relatedMatches: Match[];
  replaySuggestions: Replay[];
  autoPlay?: boolean;
}

const Breadcrumbs: React.FC<{ match: Match }> = ({ match }) => {
  const navigate = useNavigate();
  const { setSelectedSportsNavbarPage, setSelectedPage } =
    useSelectedPageContext();
  return (
    <nav
      className="text-xs text-gray-400 mb-2 px-1 flex items-center space-x-1.5 pt-4 pb-2"
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
      <ChevronRightIcon className="w-3 h-3 text-gray-500 " />
      <div
        onClick={() => {
          navigate(`/${match?.sport?.slug}`);
          localStorage.setItem(
            "selectedSportsNavbarPage",
            match?.sport?.name ?? "eSports"
          );
          setSelectedSportsNavbarPage(match?.sport?.name ?? "eSports");
        }}
        className="hover:text-yellow-400 text-xs text-white hover:text-xs cursor-pointer"
      >
        {match?.sport?.name || "Thể thao"}
      </div>
      <ChevronRightIcon className="w-3 h-3 text-gray-500" />
      <span className="truncate max-w-[200px] sm:max-w-xs text-current-color">
        {match?.title}
      </span>
    </nav>
  );
};

const MatchStreamPage: React.FC<MatchStreamPageProps> = ({
  match,
  relatedMatches,
  replaySuggestions,
  autoPlay = false,
}) => {
  const navigate = useNavigate();

  const { bannerData } = useData();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const containerRef = React.useRef<HTMLDivElement>(null);
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
          filterBanners("TOP", "LIVE_PAGE")?.imageUrl &&
          filterBanners("BOTTOM", "LIVE_PAGE")?.imageUrl &&
          filterBanners("FOOTER", "LIVE_PAGE")?.imageUrl
      ) || []
    );
  }, [bannerData]);
  const [isChatVisible, setIsChatVisible] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);

  const toggleChat = () => setIsChatVisible(!isChatVisible);
  const toggleExpand = () => setIsExpanded(!isExpanded);
  const { state } = useLocation();

  // Lấy streamLink từ state
  const streamLink = state?.streamLink;
  React.useEffect(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  return (
    <div className="flex flex-col min-h-screen w-full">
      <main
        className="w-full mx-auto 
        max-w-[640px] sm:max-w-[768px] md:max-w-[960px] 
        lg:max-w-[1024px] 
        xl:max-w-[1200px] 
        2xl:max-w-[1440px] 
        3xl:max-w-[1440px]
    "
        ref={containerRef}
      >
        <Breadcrumbs match={match} />
        {activeBanners?.length > 0 && (
          <div className="my-3 flex items-center w-full">
            <img
              src={filterBanners("TOP", "LIVE_PAGE")?.imageUrl}
              alt="Horizontal Ad Banner"
              className="w-full h-full md:h-[80px] object-cover rounded-md shadow"
            />
            <img
              src={filterBanners("TOP", "LIVE_PAGE")?.imageUrl}
              alt="Horizontal Ad Banner"
              className="w-full h-full md:h-[80px] object-cover rounded-md shadow hidden xl:block "
            />
          </div>
        )}
        <div
          style={{
            backgroundImage: `url("https://b.thapcam73.life/images/bg-topz-min.jpg")`,
            backgroundSize: "cover",
          }}
          className="w-full text-white py-4 md:py-10 text-xs md:text-base"
        >
          <div className="flex flex-col justify-center items-center w-full">
            <div className="flex items-end justify-center gap-4 md:gap-8">
              <div className="flex items-center gap-2 md:gap-3 flex-col md:flex-row flex-2 min-w-0">
                <span className="font-medium text-[9px] md:text-base line-clamp-1 hidden md:block max-w-[100px] md:max-w-[250px] truncate">
                  {match?.homeTeam?.name}
                </span>
                {match?.homeTeam?.name?.startsWith("Việt Nam") ? (
                  <img
                    className="w-10 md:w-16 h-8 md:h-12"
                    src={match?.homeTeam?.logo}
                    alt={match?.homeTeam?.name}
                  />
                ) : (
                  <img
                    className="w-12 md:w-16 h-12 md:h-16"
                    src={match?.homeTeam?.logo}
                    alt={match?.homeTeam?.name}
                  />
                )}
                <span className="font-medium text-[11px] md:text-base line-clamp-1 md:hidden max-w-[100px] md:max-w-[250px] truncate">
                  {match?.homeTeam?.name}
                </span>
              </div>
              <div className="flex flex-col gap-3 md:gap-0 items-center justify-center flex-1 min-w-0">
                <span className="pb-2 md:pb-4 text-[12px] md:text-base line-clamp-1 text-center max-w-[150px] md:max-w-[300px] truncate font-medium">
                  {match?.league?.name}
                </span>
                <div className="flex flex-col gap-0 md:gap-1 items-center justify-center">
                  <span className="font-bold text-[11px] md:text-sm text-red-500">
                    {match?.status === "LIVE"
                      ? "ĐANG DIỄN RA"
                      : match?.status === "FINISHED"
                      ? "KẾT THÚC"
                      : match?.status === "UPCOMING"
                      ? "SẮP DIỄN RA"
                      : match?.status === "CANCELLED"
                      ? "ĐÃ HỦY"
                      : match?.status === "POSTPONED"
                      ? "DỜI TRẬN"
                      : ""}
                  </span>
                  <span className="font-medium text-xl md:text-2xl">
                    {match?.scores?.homeScore} - {match?.scores?.awayScore}
                  </span>
                  <span className="text-xs md:text-sm font-medium">
                    {new Date(match?.startTime ?? "").toLocaleString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-3 md:flex-row flex-col flex-2 min-w-0">
                {match?.awayTeam?.name?.startsWith("Việt Nam") ? (
                  <img
                    className="w-10 md:w-16 h-8 md:h-12"
                    src={match?.awayTeam?.logo}
                    alt={match?.awayTeam?.name}
                  />
                ) : (
                  <img
                    className="w-12 md:w-16 h-12 md:h-16"
                    src={match?.awayTeam?.logo}
                    alt={match?.awayTeam?.name}
                  />
                )}
                <span className="font-medium text-[11px] md:text-base line-clamp-1 max-w-[100px] md:max-w-[250px] truncate">
                  {match?.awayTeam?.name}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="relative w-full md:h-10 h-6">
          <div className="mt-3 flex items-center gap-2">
            {match?.streamLinks?.map((link) => {
              const commentator = link?.commentator;
              const commentatorName =
                typeof commentator === "object" && commentator?._id
                  ? commentator.username ||
                    `${commentator.firstname ?? ""} ${
                      commentator.lastname ?? ""
                    }`.trim() ||
                    "Chưa cập nhật BLV"
                  : "Chưa cập nhật BLV";
              const commentatorImage =
                typeof commentator === "object" && commentator?.avatar !== ""
                  ? commentator.avatar ?? briefcase
                  : briefcase;
              return (
                <div key={link?.label}>
                  <a
                    href=""
                    onClick={() =>
                      navigate(
                        `/truc-tiep/${match?.slug}/${match?.sport?.slug}`,
                        {
                          state: { streamLink: link },
                        }
                      )
                    }
                  >
                    <button
                      className={
                        streamLink?.commentator?.username
                          ? streamLink?.commentator?.username ===
                            commentatorName
                            ? "bg-orange-500 text-white px-2 py-0.5 md:py-1 rounded-[4px] flex items-center gap-2"
                            : "bg-[#343434] text-white px-2 py-0.5 md:py-1 rounded-[4px] flex items-center gap-2"
                          : "bg-orange-500 text-white px-2 py-0.5 md:py-1 rounded-[4px] flex items-center gap-2"
                      }
                    >
                      <img
                        src={commentatorImage}
                        className="w-5 md:w-8 h-5 md:h-8 object-cover rounded-full"
                        alt=""
                      />
                      <span className="font-medium md:font-bold text-[9px] md:text-xs">
                        {commentatorName}
                      </span>
                    </button>
                  </a>
                </div>
              );
            })}
          </div>
          <div className="absolute top-2 right-0 md:right-0 z-50 hidden md:block">
            <button
              onClick={toggleChat}
              className="bg-[#343434] text-white px-4 py-1 rounded-[4px] transition flex items-center gap-1"
            >
              <ChatBubbleOvalLeftIcon className="w-4 h-4" />{" "}
              <span className="text-[13px]">
                {isChatVisible ? "Tắt chat" : "Bật chat"}
              </span>
            </button>
            {/* <button
              onClick={toggleExpand}
              className="bg-blue-600 text-white px-4 py-1 rounded-xl hover:bg-blue-700 transition"
            >
              Mở rộng
            </button> */}
          </div>

          {/* {isExpanded && (
            <button
              onClick={toggleExpand}
              className="fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-full hover:bg-gray-700 transition z-60"
            >
              Thu gọn
            </button>
          )} */}
        </div>
        <div className="flex flex-col lg:flex-row pt-3">
          {/* Left Column: Video + Match Info + Related */}
          <div
            className={
              isMobile
                ? "sticky top-0 z-[1000] w-full"
                : "lg:w-2/3 flex-shrink-0 pr-2 "
            }
          >
            <Player
              videoUrl={`${
                streamLink?.url ? streamLink?.url : match?.streamLinks?.[0]?.url
              }`}
              videoTitle={`${match?.homeTeam?.name} vs ${match?.awayTeam?.name}`}
              posterUrl={
                match?.streamLinks?.[0]?.image
                  ? match?.streamLinks?.[0]?.image
                  : wait_football
              }
              autoPlay={autoPlay}
              match={match}
            />
            {/* <VideoPlayer
              videoUrl={`${
                streamLink?.url ? streamLink?.url : match?.streamLinks?.[0]?.url
              }`}
              videoTitle={`${match?.homeTeam?.name} vs ${match?.awayTeam?.name}`}
              posterUrl={
                match?.streamLinks?.[0]?.image
                  ? match?.streamLinks?.[0]?.image
                  : wait_football
              }
              autoPlay={autoPlay}
              match={match}
            /> */}
            <div className="hidden md:block">
              <MatchInfoBar match={match} />
            </div>
            <div className="mt-1 hidden md:block">
              <SportSection
                title="CÁC TRẬN ĐẤU KHÁC"
                matches={relatedMatches}
              />
            </div>
          </div>

          {/* Right Column: Chat + Replays */}
          <div className="md:right-0 z-50 md:hidden flex w-full justify-end py-2">
            <button
              onClick={toggleChat}
              className="bg-[#343434] text-white px-4 py-1 rounded-[4px] transition flex items-center gap-1"
            >
              <ChatBubbleOvalLeftIcon className="w-4 h-4" />{" "}
              <span className="text-[13px]">
                {isChatVisible ? "Tắt chat" : "Bật chat"}
              </span>
            </button>
            {/* <button
              onClick={toggleExpand}
              className="bg-blue-600 text-white px-4 py-1 rounded-xl hover:bg-blue-700 transition"
            >
              Mở rộng
            </button> */}
          </div>
          <div className="lg:w-1/3 flex-shrink-0 relative">
            <div className="relative w-full h-[600px]">
              {!isChatVisible && (
                <button
                  onClick={toggleChat}
                  className="bg-yellow-600 flex items-center gap-1 text-white px-4 py-1.5 rounded-full shadow-lg hover:bg-yellow-700 transition absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20"
                >
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />{" "}
                  <span className="text-sm font-medium">Xem bình luận</span>
                </button>
              )}
              <ChatPanel isChatVisible={isChatVisible} />
            </div>
            <div className="mt-1 md:hidden">
              <SportSection
                title="CÁC TRẬN ĐẤU KHÁC"
                matches={relatedMatches}
              />
            </div>
            <div className="pb-4">
              {activeBanners?.length > 0 && (
                <img
                  src={filterBanners("FOOTER", "LIVE_PAGE")?.imageUrl}
                  alt="Small Ad Banner"
                  className="w-full rounded-md shadow"
                />
              )}
            </div>
            <div className="pb-3">
              <ReplaySuggestionsPanel replays={replaySuggestions} />
            </div>
          </div>
          {activeBanners?.length > 0 && (
            <div className="pb-8 pt-4 flex items-center w-full">
              <img
                src={filterBanners("BOTTOM", "LIVE_PAGE")?.imageUrl}
                alt="Horizontal Ad Banner"
                className="w-full h-full md:h-[80px] object-cover rounded-md shadow"
              />
              <img
                src={filterBanners("BOTTOM", "LIVE_PAGE")?.imageUrl}
                alt="Horizontal Ad Banner"
                className="w-full h-full md:h-[80px] object-cover rounded-md shadow hidden xl:block"
              />
            </div>
          )}
          {location.pathname.startsWith("/truc-tiep") && isMobile ? (
            <FooterInfo />
          ) : (
            ""
          )}
        </div>
      </main>
    </div>
  );
};

export default MatchStreamPage;
// import VideoPlayer from "@/components/layout/VideoPlayer";
// import MatchInfoBar from "@/components/layout/MatchInfoBar";
// import ChatPanel from "@/components/layout/ChatPanel";
// import ReplaySuggestionsPanel from "@/components/layout/ReplaySuggestionsPanel";
// import SportSection from "@/components/layout/SportSection";
// import { HomeIconSolid, ChevronRightIcon } from "@/components/layout/Icon";
// import * as React from "react";
// import { Match } from "@/types/match.types";
// import { Replay } from "@/types/replay.types";
// import { useSelectedPageContext } from "@/hooks/use-context";
// import { useNavigate } from "react-router-dom";
// import wait_football from "@/assets/user/wait_football.webp";
// import { useMediaQuery, useTheme } from "@mui/material";
// import { useData } from "@/context/DataContext";
// import { Banner } from "@/types/banner.types";

// interface MatchStreamPageProps {
//   match: Match;
//   relatedMatches: Match[];
//   replaySuggestions: Replay[];
//   autoPlay?: boolean;
// }

// const Breadcrumbs: React.FC<{ match: Match }> = ({ match }) => {
//   const navigate = useNavigate();
//   const { setSelectedSportsNavbarPage, setSelectedPage } =
//     useSelectedPageContext();
//   return (
//     <nav
//       className="text-xs text-gray-400 mb-2 px-1 flex items-center space-x-1.5 pt-4 pb-2"
//       aria-label="Breadcrumb"
//     >
//       <div
//         onClick={() => {
//           localStorage.removeItem("selectedSportsNavbarPage");
//           setSelectedSportsNavbarPage("");
//           localStorage.setItem("selectedPage", "TRANG CHỦ");
//           setSelectedPage("TRANG CHỦ");
//           navigate("/"); // Navigate to homepage
//         }}
//         className="hover:text-yellow-400 flex items-center text-xs text-white hover:text-xs cursor-pointer"
//       >
//         <HomeIconSolid className="w-3.5 h-3.5 mr-1" /> Trang chủ
//       </div>
//       <ChevronRightIcon className="w-3 h-3 text-gray-500 " />
//       <div
//         onClick={() => {
//           navigate(`/${match?.sport?.slug}`);
//           localStorage.setItem(
//             "selectedSportsNavbarPage",
//             match?.sport?.name ?? "eSports"
//           );
//           setSelectedSportsNavbarPage(match?.sport?.name ?? "eSports");
//         }}
//         className="hover:text-yellow-400 text-xs text-white hover:text-xs cursor-pointer"
//       >
//         {match?.sport?.name || "Thể thao"}
//       </div>
//       <ChevronRightIcon className="w-3 h-3 text-gray-500" />
//       <span className="truncate max-w-[200px] sm:max-w-xs text-current-color">
//         {match?.title}
//       </span>
//     </nav>
//   );
// };

// const MatchStreamPage: React.FC<MatchStreamPageProps> = ({
//   match,
//   relatedMatches,
//   replaySuggestions,
//   autoPlay = false,
// }) => {
//   const { bannerData } = useData();
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
//   const filterBanners = (
//     position: Banner["position"],
//     displayPage: Banner["displayPage"]
//   ): Banner | undefined => {
//     return bannerData
//       ?.filter(
//         (banner) =>
//           banner.position === position &&
//           banner.displayPage === displayPage &&
//           banner.isActive
//       )
//       .sort((a, b) => (b.priority || 0) - (a.priority || 0))[0];
//   };
//   return (
//     <div className="flex flex-col min-h-screen w-full">
//       <main
//         className="w-full mx-auto
//         max-w-[640px] sm:max-w-[768px] md:max-w-[960px]
//         lg:max-w-[1024px]
//         xl:max-w-[1200px]
//         2xl:max-w-[1440px]
//         3xl:max-w-[1440px]
//     "
//       >
//         <Breadcrumbs match={match} />
//         <div className="my-3">
//           <img
//             src={filterBanners("TOP", "LIVE_PAGE")?.imageUrl}
//             alt="Horizontal Ad Banner"
//             className="w-full rounded-md shadow"
//           />
//         </div>
//         <div
//           style={{
//             backgroundImage: `url("https://b.thapcam73.life/images/bg-topz-min.jpg")`,
//             backgroundSize: "cover",
//           }}
//           className="w-full text-white py-2 md:py-4 text-xs md:text-base"
//         >
//           <div className="flex flex-col justify-center items-center w-full">
//             <div className="flex items-end justify-center gap-12 md:gap-8">
//               <div className="flex items-center gap-3 md:gap-3 flex-col md:flex-row">
//                 <span className="font-medium text-[9px] md:text-base line-clamp-1 hidden md:block">
//                   {match?.homeTeam?.name}
//                 </span>
//                 {match?.homeTeam?.name?.startsWith("Việt Nam") ? (
//                   <img
//                     className="w-10 md:w-16 h-8 md:h-12"
//                     src={match?.homeTeam?.logo}
//                     alt={match?.homeTeam?.name}
//                   />
//                 ) : (
//                   <img
//                     className="w-12 md:w-16 h-12 md:h-16"
//                     src={match?.homeTeam?.logo}
//                     alt={match?.homeTeam?.name}
//                   />
//                 )}
//                 <span className="font-medium text-[11px] md:text-base line-clamp-1 md:hidden">
//                   {match?.homeTeam?.name}
//                 </span>
//               </div>
//               <div className="flex flex-col gap-0 md:gap-0 items-center justify-center">
//                 <span className="pb-2 md:pb-4 text-[9px] md:text-base line-clamp-1">
//                   {match?.title}
//                 </span>
//                 <div className="flex flex-col gap-1 items-center justify-center">
//                   <span className="font-bold text-[11px] md:text-sm text-red-500">
//                     {match?.status === "LIVE"
//                       ? "ĐANG DIỄN RA"
//                       : match?.status === "FINISHED"
//                       ? "KẾT THÚC"
//                       : match?.status === "UPCOMING"
//                       ? "SẮP DIỄN RA"
//                       : match?.status === "CANCELLED"
//                       ? "ĐÃ HỦY"
//                       : match?.status === "POSTPONED"
//                       ? "DỜI TRẬN"
//                       : ""}
//                   </span>
//                   <span className="font-medium text-xl md:text-2xl">
//                     {match?.scores?.homeScore} - {match?.scores?.awayScore}
//                   </span>

//                   <span className="text-xs md:text-sm font-medium">
//                     {new Date(match?.startTime ?? "").toLocaleString("vi-VN", {
//                       day: "2-digit",
//                       month: "2-digit",
//                       hour: "2-digit",
//                       minute: "2-digit",
//                       second: "2-digit",
//                       hour12: false,
//                     })}
//                   </span>
//                 </div>
//               </div>
//               <div className="flex items-center gap-3 md:gap-3 md:flex-row flex-col">
//                 {match?.awayTeam?.name?.startsWith("Việt Nam") ? (
//                   <img
//                     className="w-10 md:w-16 h-8 md:h-12"
//                     src={match?.awayTeam?.logo}
//                     alt={match?.awayTeam?.name}
//                   />
//                 ) : (
//                   <img
//                     className="w-12 md:w-16 h-12 md:h-16"
//                     src={match?.awayTeam?.logo}
//                     alt={match?.awayTeam?.name}
//                   />
//                 )}
//                 <span className="font-medium text-[11px] md:text-base line-clamp-1">
//                   {match?.awayTeam?.name}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//         {/* <div className="md:hidden">
//           <MatchInfoBar match={match} />
//         </div> */}
//         <div className="flex flex-col lg:flex-row pt-3">
//           {/* Left Column: Video + Match Info + Related */}
//           <div
//             className={
//               isMobile
//                 ? "sticky top-0 z-[1000] w-full"
//                 : "lg:w-2/3 flex-shrink-0 pr-2 "
//             }
//           >
//             {/* Sticky VideoPlayer wrapper for mobile only */}
//             <VideoPlayer
//               videoUrl={`${match?.streamLinks?.[0]?.url}`}
//               videoTitle={`${match?.homeTeam?.name} vs ${match?.awayTeam?.name}`}
//               posterUrl={
//                 match?.streamLinks?.[0]?.image
//                   ? match?.streamLinks?.[0]?.image
//                   : wait_football
//               }
//               autoPlay={autoPlay}
//               match={match}
//             />
//             <div className="hidden md:block">
//               <MatchInfoBar match={match} />
//             </div>
//             <div className="mt-1 hidden md:block">
//               <SportSection
//                 title="CÁC TRẬN ĐẤU KHÁC"
//                 matches={relatedMatches}
//               />
//             </div>
//           </div>

//           {/* Right Column: Chat + Replays */}
//           <div className="lg:w-1/3 flex-shrink-0">
//             {/* <ChatPanel /> */}
//             <iframe
//               src="https://www5.cbox.ws/box/?boxid=949782&boxtag=pXQtQ5"
//               width="100%"
//               height="600px" // Adjust height to match the desired look
//               frameBorder="0"
//               scrolling="yes"
//               style={{ border: "none", background: "#000" }} // Match the dark background
//             ></iframe>
//             <div className="mt-1 md:hidden">
//               <SportSection
//                 title="CÁC TRẬN ĐẤU KHÁC"
//                 matches={relatedMatches}
//               />
//             </div>
//             <div className="pb-4">
//               <img
//                 src={filterBanners("FOOTER", "LIVE_PAGE")?.imageUrl}
//                 alt="Small Ad Banner"
//                 className="w-full rounded-md shadow"
//               />
//             </div>
//             <ReplaySuggestionsPanel replays={replaySuggestions} />
//           </div>
//         </div>
//         <div className="pb-8 pt-4">
//           <img
//             src={filterBanners("BOTTOM", "LIVE_PAGE")?.imageUrl}
//             alt="Horizontal Ad Banner"
//             className="w-full rounded-md shadow "
//           />
//         </div>
//       </main>
//     </div>
//   );
// };

// export default MatchStreamPage;
