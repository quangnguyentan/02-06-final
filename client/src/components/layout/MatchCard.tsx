import * as React from "react";
import { FootballIcon } from "./Icon";
import { Match } from "@/types/match.types";
import { useNavigate } from "react-router-dom";
import basketball from "@/assets/user/basketball-min.jpg";
import tennis from "@/assets/user/tennis-min.jpg";
import football from "@/assets/user/football-min.jpg";
import volleyball from "@/assets/user/volleyball-min.jpg";
import boxing from "@/assets/user/boxing-min.jpg";
import race from "@/assets/user/race-min.jpg";
import esport from "@/assets/user/esport-min.jpg";
import { useSelectedPageContext } from "@/hooks/use-context";
import badminton from "@/assets/user/badminton-min.jpg";
import bida from "@/assets/user/bi-da.jpg";
import { useUserInteraction } from "@/context/UserInteractionContext";
import avatar from "@/assets/user/briefcase.png";
import Dialog from "@mui/material/Dialog";
import { PlayCircleIcon } from "@heroicons/react/24/outline";
import { Divider } from "@mui/material";
const MatchCard: React.FC<{ match: Match; small?: boolean }> = ({
  match,
  small = false,
}) => {
  const navigate = useNavigate();
  const { setSelectedSportsNavbarPage } = useSelectedPageContext();
  const { setHasUserInteracted } = useUserInteraction();
  const [open, setOpen] = React.useState(false);
  const { selectedLabel, setSelectedLabel } = useSelectedPageContext();
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const startTime = new Date(match.startTime || "").toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    // year: "numeric",
    hour12: false,
  });
  const isLive = match?.status === "LIVE";
  const targetUrl = `/truc-tiep/${match?.slug}/${match?.sport?.slug}`;
  const imageSlug =
    match?.sport?.name === "Bóng đá"
      ? football
      : match?.sport?.name === "Bóng rổ"
      ? basketball
      : match?.sport?.name === "Tennis"
      ? tennis
      : match?.sport?.name === "Bóng chuyền"
      ? volleyball
      : match?.sport?.name === "Đua xe"
      ? race
      : match?.sport?.name === "Boxing"
      ? boxing
      : match?.sport?.name === "eSports"
      ? esport
      : match?.sport?.name === "Cầu lông"
      ? badminton
      : match?.sport?.name === "Bi-a"
      ? bida
      : "";
  const commentator = match.streamLinks?.[0]?.commentator;
  const commentatorName =
    typeof commentator === "object" && commentator?._id
      ? commentator.username ||
        `${commentator.firstname || ""} ${commentator.lastname || ""}`.trim() ||
        "Chưa cập nhật BLV"
      : "Chưa cập nhật BLV";
  return location.pathname.startsWith("/truc-tiep") ? (
    <>
      <React.Fragment>
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <div className="px-4 py-6 bg-[#1E2027]">
            <div className="w-full flex justify-center items-center mb-4">
              <span className="text-white font-medium text-lg">
                CHỌN ĐẦU CẦU
              </span>
            </div>
            <div className="flex flex-col gap-4">
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
                    ? commentator.avatar ?? avatar
                    : avatar;
                return (
                  <>
                    <div
                      key={commentatorName}
                      className="flex items-center justify-between w-[270px] cursor-pointer"
                      onClick={() => {
                        navigate(
                          `/truc-tiep/${match?.slug}/${match?.sport?.slug}`,
                          { state: { streamLink: link } }
                        );
                        handleClose();
                      }}
                    >
                      <a href="" className="flex items-center gap-2">
                        <img
                          src={commentatorImage}
                          alt={commentatorName}
                          className="w-10 h-10"
                        />
                        <div>
                          <span className="text-white font-semibold">
                            {commentatorName}
                          </span>
                        </div>
                      </a>
                      <PlayCircleIcon className="stroke-orange-300 w-6 h-6" />
                    </div>
                    <Divider className="!border-white" />
                  </>
                );
              })}
            </div>
          </div>
        </Dialog>
      </React.Fragment>
      <a
        href={targetUrl}
        onClick={(e) => {
          localStorage.setItem("selectedLabel", "HDNhanh"); // Lưu vào localStorage
          if ((match?.streamLinks?.length as number) > 1) {
            handleClickOpen(); // Gọi hàm để mở dialog
          }
          setHasUserInteracted(true);

          setSelectedSportsNavbarPage(match?.sport?.name ?? "");
          localStorage.setItem(
            "selectedSportsNavbarPage",
            match?.sport?.name ?? ""
          );
        }}
        className={`bg-slate-800 rounded-xl shadow-md overflow-hidden my-1 ml-1 ${
          small
            ? "w-[260px] sm:w-[320px] md:w-[390px]"
            : "w-72 sm:w-80 md:w-[420px] xl:w-[450px]"
        } flex-shrink-0 cursor-pointer relative`}
        style={{
          backgroundImage: `url(${imageSlug})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          boxShadow: "0 0 0 2px rgba(255, 164, 92, 0.6)",
        }}
      >
        <div className="p-2 sm:p-3 relative z-10">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-1 text-xs text-gray-400">
              <span className="truncate max-w-[60px] sm:max-w-[140px] text-white sm:text-sm font-medium">
                {match.league?.name ?? match?.title}
              </span>
            </div>
            {isLive && (
              <div className="absolute translate-x-1/2 w-full right-4 z-10">
                <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded font-bold uppercase">
                  LIVE
                </span>
              </div>
            )}
            <div className="text-xs text-white whitespace-nowrap sm:text-sm font-medium truncate">
              {startTime}
            </div>
          </div>

          <div className="flex items-center justify-between my-2 sm:my-3">
            <div className="flex flex-col items-center text-center w-2/5">
              <img
                src={match?.homeTeam?.logo ?? ""}
                alt={match?.homeTeam?.name}
                className="w-10 h-10 sm:w-12 sm:h-12 xl:w-16 xl:h-16 object-contain mb-1"
              />
              <span className="text-white text-xs sm:text-sm font-medium truncate w-full">
                {match.homeTeam?.name}
              </span>
            </div>

            <div className="flex flex-col items-center text-center">
              {match?.status && match?.scores ? (
                <div className="text-center">
                  <span className="text-xs md:text-xl font-bold text-white flex items-center justify-center w-12">
                    {match?.scores?.homeScore} - {match?.scores?.awayScore}
                  </span>
                </div>
              ) : (
                <span className="text-gray-400 text-base sm:text-lg font-semibold px-2">
                  VS
                </span>
              )}
            </div>

            <div className="flex flex-col items-center text-center w-2/5">
              <img
                src={match?.awayTeam?.logo ?? ""}
                alt={match?.awayTeam?.name}
                className="w-10 h-10 sm:w-12 sm:h-12 xl:w-16 xl:h-16 object-contain mb-1"
              />
              <span className="text-white text-xs sm:text-sm font-medium truncate w-full">
                {match.awayTeam?.name}
              </span>
            </div>
          </div>
        </div>

        <div
          className="p-2 sm:p-2 flex flex-col sm:flex-row items-center justify-between gap-2 relative z-10"
          style={{
            boxShadow: "0 0 0 2px rgba(255, 164, 92, 0.6)",
          }}
        >
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-between">
            <div className="flex items-center gap-2">
              {match?.streamLinks?.[0]?.commentatorImage && (
                <img
                  src={match?.streamLinks[0]?.commentatorImage}
                  alt={commentatorName}
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full"
                />
              )}
              {match?.streamLinks?.[0]?.commentator && (
                <span className="text-xs sm:text-sm text-white truncate max-w-[90px] sm:max-w-[120px]">
                  {commentatorName}
                </span>
              )}
            </div>
            <div className="sm:hidden flex items-center gap-1 w-2/4">
              <a className="bg-blue-600 hover:bg-blue-500 text-white hover:text-[#333] font-semibold py-1 rounded transition-colors text-center w-full !text-[9px]">
                Xem Ngay
              </a>
              <a
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 rounded transition-colors text-center w-full !text-[9px]"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                Đặt Cược
              </a>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <a className="bg-blue-600 hover:bg-blue-500 text-white hover:text-[#333] sm:text-sm font-semibold py-1 px-6 sm:px-3 rounded transition-colors text-center w-full sm:w-auto !text-sm">
              Xem Ngay
            </a>
            <a
              className="bg-green-500 hover:bg-green-600 text-white sm:text-sm font-semibold py-1 px-2 sm:px-3 rounded transition-colors text-center w-full sm:w-auto !text-sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              Đặt Cược
            </a>
          </div>
        </div>
      </a>
    </>
  ) : (
    <>
      <React.Fragment>
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <div className="px-4 py-6 bg-[#1E2027]">
            <div className="w-full flex justify-center items-center mb-4">
              <span className="text-white font-medium text-sm md:text-base">
                CHỌN ĐẦU CẦU
              </span>
            </div>
            <div className="flex flex-col gap-4">
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
                    ? commentator.avatar ?? avatar
                    : avatar;
                return (
                  <>
                    <div
                      onClick={() =>
                        navigate(
                          `/truc-tiep/${match?.slug}/${match?.sport?.slug}`,
                          { state: { streamLink: link } }
                        )
                      }
                      key={commentatorName}
                      className="flex items-center justify-between w-[270px] cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={commentatorImage}
                          alt={commentatorName}
                          className="w-6 h-6 md:w-10 md:h-10"
                        />
                        <div>
                          <span className="text-white font-semibold text-xs md:text-base">
                            {commentatorName}
                          </span>
                        </div>
                      </div>
                      <PlayCircleIcon className="stroke-orange-300 w-4 h-4 md:w-6 md:h-6" />
                    </div>
                    <Divider className="!border-white" />
                  </>
                );
              })}
            </div>
          </div>
        </Dialog>
      </React.Fragment>
      <div
        onClick={() => {
          localStorage.setItem("selectedLabel", "HDNhanh"); // Lưu vào localStorage
          setSelectedLabel("HDNhanh");
          if ((match?.streamLinks?.length as number) > 1) {
            handleClickOpen();
          } else {
            setHasUserInteracted(true);
            navigate(targetUrl);
            setSelectedSportsNavbarPage(match?.sport?.name ?? "");
            localStorage.setItem(
              "selectedSportsNavbarPage",
              match?.sport?.name ?? ""
            );
          }
        }}
        className={`bg-slate-800 rounded-xl shadow-md overflow-hidden my-1 ml-1 ${
          small
            ? "w-[260px] sm:w-[320px] md:w-[390px]"
            : "w-72 sm:w-80 md:w-[420px] xl:w-[450px]"
        } flex-shrink-0 cursor-pointer relative`}
        style={{
          backgroundImage: `url(${imageSlug})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          boxShadow: "0 0 0 2px rgba(255, 164, 92, 0.6)",
        }}
      >
        <div className="p-2 sm:p-3 relative z-10">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-1 text-xs text-gray-400">
              <span className="truncate max-w-[60px] sm:max-w-[140px] text-white sm:text-sm font-medium">
                {match.league?.name ?? match?.title}
              </span>
            </div>
            {isLive && (
              <div className="absolute translate-x-1/2 w-full right-4 z-10">
                <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded font-bold uppercase">
                  LIVE
                </span>
              </div>
            )}
            <div className="text-xs text-white whitespace-nowrap sm:text-sm font-medium truncate">
              {startTime}
            </div>
          </div>

          <div className="flex items-center justify-between my-2 sm:my-3">
            <div className="flex flex-col items-center text-center w-2/5">
              <img
                src={match?.homeTeam?.logo ?? ""}
                alt={match?.homeTeam?.name}
                className="w-10 h-10 sm:w-12 sm:h-12 xl:w-16 xl:h-16 object-contain mb-1"
              />
              <span className="text-white text-xs sm:text-sm font-medium truncate w-full">
                {match.homeTeam?.name}
              </span>
            </div>

            <div className="flex flex-col items-center text-center">
              {match?.status && match?.scores ? (
                <div className="text-center">
                  <span className="text-xs md:text-xl font-bold text-white flex items-center justify-center w-12">
                    {match?.scores?.homeScore} - {match?.scores?.awayScore}
                  </span>
                </div>
              ) : (
                <span className="text-gray-400 text-base sm:text-lg font-semibold px-2">
                  VS
                </span>
              )}
            </div>

            <div className="flex flex-col items-center text-center w-2/5">
              <img
                src={match?.awayTeam?.logo ?? ""}
                alt={match?.awayTeam?.name}
                className="w-10 h-10 sm:w-12 sm:h-12 xl:w-16 xl:h-16 object-contain mb-1"
              />
              <span className="text-white text-xs sm:text-sm font-medium truncate w-full">
                {match.awayTeam?.name}
              </span>
            </div>
          </div>
        </div>

        <div
          className="p-2 sm:p-2 flex flex-col sm:flex-row items-center justify-between gap-2 relative z-10"
          style={{
            boxShadow: "0 0 0 2px rgba(255, 164, 92, 0.6)",
          }}
        >
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-between">
            <div className="flex items-center gap-2">
              {(match?.streamLinks?.length as number) > 1 ? (
                <img
                  src={avatar}
                  alt={commentatorName}
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full"
                />
              ) : (
                match?.streamLinks?.[0]?.commentatorImage && (
                  <img
                    src={match?.streamLinks[0]?.commentatorImage}
                    alt={commentatorName}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full"
                  />
                )
              )}

              {(match?.streamLinks?.length as number) > 1 ? (
                <span className="text-xs md:text-sm text-white truncate max-w-[90px] sm:max-w-[120px]">
                  {match?.streamLinks?.length} Đầu Cầu
                </span>
              ) : (
                match?.streamLinks?.[0]?.commentator && (
                  <span className="text-xs md:text-sm text-white truncate max-w-[90px] sm:max-w-[120px]">
                    {commentatorName}
                  </span>
                )
              )}
            </div>
            <div className="sm:hidden flex items-center gap-1 w-2/4">
              <a className="bg-blue-600 hover:bg-blue-500 text-white hover:text-[#333] font-semibold py-1 rounded transition-colors text-center w-full !text-[9px]">
                Xem Ngay
              </a>
              <a
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 rounded transition-colors text-center w-full !text-[9px]"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                Đặt Cược
              </a>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <a className="bg-blue-600 hover:bg-blue-500 text-white hover:text-[#333] sm:text-sm font-semibold py-1 px-6 sm:px-3 rounded transition-colors text-center w-full sm:w-auto !text-sm">
              Xem Ngay
            </a>
            <a
              className="bg-green-500 hover:bg-green-600 text-white sm:text-sm font-semibold py-1 px-2 sm:px-3 rounded transition-colors text-center w-full sm:w-auto !text-sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              Đặt Cược
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default MatchCard;
