import React, {
  FC,
  MouseEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Hls from "hls.js";
import screenfull from "screenfull";
import { isIOS, isMobile } from "mobile-device-detect";
import { FaPlay, FaPause, FaRedo } from "react-icons/fa";
import {
  PlayCircleIconSolid,
  PauseCircleIconSolid,
  SpeakerWaveIconSolid,
  SpeakerXMarkIconSolid,
} from "./Icon";
import { Cog8ToothIcon } from "@heroicons/react/24/solid";
import { useUserInteraction } from "@/context/UserInteractionContext";
import { useTheme, useMediaQuery } from "@mui/material";
import { Match } from "@/types/match.types";
import { Banner } from "@/types/banner.types";
import { useData } from "@/context/DataContext";
import banner_esport_timer from "@/assets/user/banner_timmer.jpg";
import banner_bida_timer from "@/assets/user/bida copy.jpg";
import banner_football_timer from "@/assets/user/bóng đá 1 copy.jpg";
import banner_volleyball_timer from "@/assets/user/bóng chuyền copy.jpg";
import banner_basketball_timer from "@/assets/user/bóng rổ copy.jpg";
import banner_tennis_timer from "@/assets/user/tennis copy.jpg";
import banner_badminton_timer from "@/assets/user/cầu lông copy.jpg";
import banner_boxing_timer from "@/assets/user/boxing copy.jpg";
import banner_racing_timer from "@/assets/user/xe đua copy.jpg";
import { useLocation } from "react-router-dom";
import { VideoController } from "../controllers/video-controller";

// Styled components from Player
import {
  FirstPlayOverlay,
  FirstPlayButton,
  FullscreenButton,
  PlayPauseButton,
  ProgressAndTimerContainer,
  StyledContainer,
  StyledControls,
  StyledPlayer,
  IconOverlay,
  StyledBanner,
} from "./Player.styles";
import { Progress } from "../progress/Progress";
import { Timer } from "../timer/Timer";
import { Volume } from "../volume/Volume";

interface ExtendedVideoElement extends HTMLVideoElement {
  webkitEnterFullscreen?: () => void;
  webkitExitFullscreen?: () => void;
  webkitDisplayingFullscreen?: boolean;
  msRequestFullscreen?: () => void;
}

interface VideoPlayerProps {
  videoTitle?: string;
  videoUrl?: string;
  posterUrl?: string;
  isYouTubeStream?: boolean;
  mimeType?: string;
  autoPlay?: boolean;
  match?: Match;
}

const minuteSeconds = 60;
const hourSeconds = 3600;
const daySeconds = 86400;

export const Spinner = () => (
  <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
    <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
  </div>
);

const Player: FC<VideoPlayerProps> = ({
  videoTitle = "Live Stream",
  videoUrl,
  posterUrl,
  isYouTubeStream = false,
  mimeType = "auto",
  autoPlay = false,
  match,
}) => {
  const { bannerData } = useData();
  const theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down("sm"));
  const [element, setElement] = useState<ExtendedVideoElement | null>(null);
  const [controller, setController] = useState<VideoController | null>(null);
  const [playingState, setPlayingState] = useState<
    "playing" | "paused" | "ended"
  >("paused");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [wasFirstPlayed, setWasFirstPlayed] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [showIcon, setShowIcon] = useState<"play" | "pause" | "replay" | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isBufferReady, setIsBufferReady] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState(false);
  const [qualityLevels, setQualityLevels] = useState<
    { id: number; height: number }[]
  >([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [countdownActive, setCountdownActive] = useState(false);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const iconTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<number>(0);
  const doubleTapDelay = 300;
  const [isLoadingHLS, setIsLoadingHLS] = useState<boolean>(false);
  const { hasUserInteracted, setHasUserInteracted } = useUserInteraction();
  const { pathname } = useLocation();
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const isYouTubeUrl = videoUrl?.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([a-zA-Z0-9_-]{11})/
  );
  const youTubeVideoId = isYouTubeUrl ? isYouTubeUrl[1] : null;

  const isFacebookUrl = videoUrl?.match(
    /(?:https?:\/\/)?(?:www\.)?facebook\.com\/.*(?:reel|watch|video)\/(\d+)/
  );
  const facebookVideoId = isFacebookUrl ? isFacebookUrl[1] : null;

  const isTikTokUrl = videoUrl?.match(
    /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[\w\d._]+\/video\/(\d+)/
  );
  const tikTokVideoId = isTikTokUrl ? isTikTokUrl[1] : null;

  const getIOSVersion = () => {
    const match = navigator.userAgent.match(/OS (\d+)_(\d+)/);
    return match ? parseFloat(`${match[1]}.${match[2]}`) : null;
  };

  const iosVersion = getIOSVersion();

  // Countdown timer logic (unchanged)
  useEffect(() => {
    const updateTimer = () => {
      const startTimeVN = new Date(
        new Date(match?.startTime || "").toLocaleString("en-US", {
          timeZone: "Asia/Ho_Chi_Minh",
        })
      ).getTime();
      const nowVN = new Date(
        new Date().toLocaleString("en-US", {
          timeZone: "Asia/Ho_Chi_Minh",
        })
      ).getTime();
      const totalRemainingTime = Math.max(
        Math.floor((startTimeVN - nowVN) / 1000),
        0
      );

      const days = Math.floor(totalRemainingTime / daySeconds);
      const hours = Math.floor((totalRemainingTime % daySeconds) / hourSeconds);
      const minutes = Math.floor(
        (totalRemainingTime % hourSeconds) / minuteSeconds
      );
      const seconds = Math.floor(totalRemainingTime % minuteSeconds);

      setTimeRemaining({ days, hours, minutes, seconds });
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);
    return () => clearInterval(intervalId);
  }, [match?.startTime]);

  // Banner filtering logic (unchanged)
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
          b.isActive !== false && filterBanners("INLINE", "LIVE_PAGE")?.imageUrl
      ) || []
    );
  }, [bannerData]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Fullscreen handling from Player
  useEffect(() => {
    if (screenfull.isEnabled) {
      screenfull.on("change", () => {
        setIsFullscreen(screenfull.isFullscreen);
      });
    }
  }, []);

  // Auto-hide controls after 3 seconds on mobile (from Player)
  useEffect(() => {
    if (
      isMobile &&
      playingState === "playing" &&
      wasFirstPlayed &&
      !isFullscreen
    ) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    } else {
      setShowControls(true);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [playingState, wasFirstPlayed, isFullscreen]);

  // Hide icon after 1 second (from Player)
  useEffect(() => {
    if (showIcon) {
      iconTimeoutRef.current = setTimeout(() => {
        setShowIcon(null);
      }, 1000);
    }

    return () => {
      if (iconTimeoutRef.current) {
        clearTimeout(iconTimeoutRef.current);
      }
    };
  }, [showIcon]);

  // Video and HLS initialization (from Player)
  useEffect(() => {
    if (element && videoUrl) {
      const newVideoController = new VideoController(element);
      setController(newVideoController);

      const isHlsSource = videoUrl.includes(".m3u8");

      if (isHlsSource) {
        setIsLoadingHLS(true);
        if (Hls.isSupported()) {
          const hls = new Hls();
          // const hls = new Hls();
          hlsRef.current = hls;
          hls.attachMedia(element);
          hls.on(Hls.Events.MEDIA_ATTACHED, () => {
            hls.loadSource(videoUrl);
            hls.startLoad(0);
            // setQualityLevels(
            //   hls.levels.map((level, index) => ({
            //     id: index,
            //     height: level.height || 1080,
            //   }))
            // );
          });

          hls.on(Hls.Events.BUFFER_APPENDED, (event, data) => {
            if (data.timeRanges?.video && data.timeRanges.video.end(0) > 3) {
              setIsBufferReady(true);
              setIsLoadingHLS(false);
            }
          });

          hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
            setCurrentLevel(data.level);
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            console.warn("HLS.js error:", data);
            if (data.fatal) {
              setIsLoadingHLS(false);
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  setTimeout(() => hls.startLoad(), 1000);
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  hls.recoverMediaError();
                  break;
                default:
                  // setError("Lỗi phát video, vui lòng thử lại.");
                  break;
              }
            }
          });
        } else if (element.canPlayType("application/vnd.apple.mpegurl")) {
          element.src = videoUrl;
          element.preload = "auto";
          setIsLoadingHLS(false);
          setIsBufferReady(true);
          const handleWaiting = () => {
            setIsLoadingHLS(true);
            setIsBufferReady(false);
          };
          const handleCanPlayThrough = () => {
            setIsLoadingHLS(false);
            setIsBufferReady(true);
          };

          element.addEventListener("waiting", handleWaiting);
          element.addEventListener("canplaythrough", handleCanPlayThrough); // Chỉ sử dụng canplaythrough
          element.addEventListener("error", () => {
            setIsLoadingHLS(false);
            setError("Lỗi tải video HLS, vui lòng thử lại.");
          });

          return () => {
            element.removeEventListener("waiting", handleWaiting);
            element.removeEventListener("canplaythrough", handleCanPlayThrough);
            element.removeEventListener("error", () => {});
          };
        } else {
          // setError("Trình duyệt không hỗ trợ HLS.");
          setIsLoadingHLS(false);
        }
      } else {
        element.src = videoUrl;
        element.preload = "auto";
        setIsBufferReady(true);
        setIsLoadingHLS(false);
      }

      setWasFirstPlayed(false);
      return () => {
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
        newVideoController.dispose();
      };
    }
  }, [element, videoUrl]);

  // Track playing state (from Player)
  useEffect(() => {
    if (controller) {
      controller.subscribe("playingState", async () => {
        setPlayingState(controller.getPlayingState());
      });
      controller.subscribe("seeking", async () =>
        setPlayingState(controller.getPlayingState())
      );
    }
  }, [controller]);

  // Play, pause, and replay handlers (from Player)
  const handlePlay = useCallback(() => {
    if (controller) {
      if (!videoUrl?.includes(".m3u8") || isBufferReady) {
        controller.play();
        setShowIcon("play");
        setError(null);
        setWasFirstPlayed(true);
        setHasUserInteracted(true);
        if (isMobile) {
          setShowControls(false);
        }
      } else {
        hlsRef.current?.startLoad(0);
        // setTimeout(() => {
        if (isBufferReady) {
          controller.play();
          setShowIcon("play");
          setError(null);
          setWasFirstPlayed(true);
          setHasUserInteracted(true);
          if (isMobile) {
            setShowControls(false);
          }
        } else {
          // setError("Đang tải video, vui lòng đợi...");
        }
        // }, 1000);
      }
    }
  }, [controller, videoUrl, isBufferReady, setHasUserInteracted]);

  const handlePause = useCallback(() => {
    controller?.pause();
    setShowIcon("pause");
    if (isMobile) {
      setShowControls(false);
    }
  }, [controller]);

  const handlePlayAgain = useCallback(() => {
    controller?.replay();
    setShowIcon("replay");
    setError(null);
    if (isMobile) {
      setShowControls(true);
    }
  }, [controller]);

  // Fullscreen toggle (from Player)
  const handleToggleFullscreen: MouseEventHandler<HTMLButtonElement> =
    useCallback(() => {
      if (screenfull.isEnabled && containerRef.current) {
        screenfull.toggle(containerRef.current);
      } else if (
        element &&
        (element as any)?.webkitSupportsPresentationMode?.("fullscreen")
      ) {
        (element as any)?.webkitSetPresentationMode(
          isFullscreen ? "inline" : "fullscreen"
        );
      }
    }, [element, isFullscreen]);

  // Container click handler (from Player)
  const handleContainerClick = useCallback(() => {
    if (!isMobile) {
      if (controller?.getPlayingState() === "paused") {
        setWasFirstPlayed(true);
        controller?.play();
        setShowIcon("play");
        setError(null);
        setHasUserInteracted(true);
      } else if (controller?.getPlayingState() === "playing") {
        controller?.pause();
        setShowIcon("pause");
      }
    }
  }, [controller, setHasUserInteracted]);

  // Controls click handler (from Player)
  const handleControlsClick: MouseEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      event.stopPropagation();
      setShowControls(true);
    },
    []
  );

  // Mouse move handler (from Player)
  const handleMouseMove = useCallback(() => {
    if (!isMobile) {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (playingState === "playing" && !isFullscreen) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    }
  }, [playingState, isFullscreen]);

  // Touch start handler (from Player)
  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (!isMobile) return;
      const now = new Date().getTime();
      const timeSinceLastTap = now - lastTapRef.current;

      if (timeSinceLastTap < doubleTapDelay && timeSinceLastTap > 0) {
        handleToggleFullscreen({} as React.MouseEvent<HTMLButtonElement>);
      } else {
        setShowControls((prev) => !prev);
        if (controller?.getPlayingState() === "paused") {
          setWasFirstPlayed(true);
          handlePlay();
        }
      }

      lastTapRef.current = now;
    },
    [controller, handlePlay, handleToggleFullscreen]
  );

  // Settings handler (unchanged)
  const handleSettings = () => {
    setShowSettings(!showSettings);
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  // Quality change handler (unchanged)
  const handleQualityChange = (levelId: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelId;
      setCurrentLevel(levelId);
      setShowSettings(false);
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  // Handle video error for countdown (unchanged)
  useEffect(() => {
    if (element) {
      const handleError = () => {
        const startTimeVN = new Date(
          new Date(match?.startTime || "").toLocaleString("en-US", {
            timeZone: "Asia/Ho_Chi_Minh",
          })
        ).getTime();
        const nowVN = new Date().toLocaleString("en-US", {
          timeZone: "Asia/Ho_Chi_Minh",
        });
        const nowVNTime = new Date(nowVN).getTime();
        if (match?.status !== "LIVE" && startTimeVN > nowVNTime) {
          setCountdownActive(true);
        }
      };
      element.addEventListener("error", handleError);
      return () => {
        element.removeEventListener("error", handleError);
      };
    }
  }, [element, match?.startTime, match?.status]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isMobile) return;
      if (e.key === "f" || e.key === "F") handleToggleFullscreen({} as any);
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        if (controller?.getPlayingState() === "paused") {
          setWasFirstPlayed(true);
          handlePlay();
        } else if (controller?.getPlayingState() === "playing") handlePause();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [controller, handlePlay, handlePause, handleToggleFullscreen]);

  if (!videoUrl || videoUrl === "undefined") {
    return (
      <div className="relative w-full aspect-video bg-black text-white rounded-lg shadow-2xl flex items-center justify-center">
        <div
          className="absolute inset-0 flex items-center justify-start bg-black/70 text-white text-center p-8 md:p-2 pt-12 md:pt-12 z-10"
          style={{
            backgroundImage: `url(${
              match?.sport?.slug === "esports"
                ? banner_esport_timer
                : match?.sport?.slug === "football"
                ? banner_football_timer
                : match?.sport?.slug === "pool"
                ? banner_bida_timer
                : match?.sport?.slug === "tennis"
                ? banner_tennis_timer
                : match?.sport?.slug === "race"
                ? banner_racing_timer
                : match?.sport?.slug === "wwe"
                ? banner_boxing_timer
                : match?.sport?.slug === "basketball"
                ? banner_basketball_timer
                : match?.sport?.slug === "badminton"
                ? banner_badminton_timer
                : match?.sport?.slug === "volleyball"
                ? banner_volleyball_timer
                : banner_esport_timer
            })`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="relative w-full max-w-md px-4 md:p-4 bg-black/50 rounded-lg">
            <div className="flex items-center justify-between sm:mb-0 md:mb-4 w-full">
              <div className="flex flex-col items-center w-2/6">
                <img
                  src={match?.homeTeam?.logo ?? ""}
                  alt={match?.homeTeam?.name}
                  className="w-8 md:w-12 h-8 md:h-12 object-contain mb-1"
                />
                <span className="text-white text-[10px] md:text-xs font-medium truncate w-full">
                  {match?.homeTeam?.name ?? "Team A"}
                </span>
              </div>
              <div className="text-center">
                <div className="flex flex-col items-center md:items-start text-left mb-0 md:mb-2 gap-1 w-full">
                  <span className="text-white text-[10px] font-semibold md:text-sm truncate w-full">
                    {match?.league?.name ?? "N/A"}
                  </span>
                  <span className="text-white text-[10px] font-semibold md:text-sm">
                    {new Date(match?.startTime ?? "").toLocaleString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                      timeZone: "Asia/Ho_Chi_Minh",
                    })}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center w-2/6">
                <img
                  src={match?.awayTeam?.logo ?? ""}
                  alt={match?.awayTeam?.name}
                  className="w-8 md:w-12 h-8 md:h-12 object-contain mb-1"
                />
                <span className="text-white text-[10px] md:text-xs font-medium truncate w-full">
                  {match?.awayTeam?.name ?? "Team B"}
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-2 mb-1 md:mb-4">
              <span className="text-white font-semibold text-xs md:text-sm">
                Trận đấu sẽ bắt đầu sau
              </span>
            </div>
            <div className="flex flex-row justify-center items-center space-x-4 bg-gray-800 p-1 md:p-2 rounded">
              <div className="text-center">
                <span className="text-white text-sm md:text-2xl font-bold">
                  {timeRemaining.days}
                </span>
                <div className="text-white text-[10px] md:text-sm">Ngày</div>
              </div>
              <div className="text-center">
                <span className="text-white text-sm md:text-2xl font-bold">
                  {timeRemaining.hours}
                </span>
                <div className="text-white text-[10px] md:text-sm">Giờ</div>
              </div>
              <div className="text-center">
                <span className="text-white text-sm md:text-2xl font-bold">
                  {timeRemaining.minutes}
                </span>
                <div className="text-white text-[10px] md:text-sm">Phút</div>
              </div>
              <div className="text-center">
                <span className="text-white text-sm md:text-2xl font-bold">
                  {timeRemaining.seconds}
                </span>
                <div className="text-white text-[10px] md:text-sm">Giây</div>
              </div>
            </div>

            <div className="md:flex justify-center gap-2 mt-4 hidden">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded text-sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                XEM NGAY
              </button>
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded text-sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                CƯỢC NGAY
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (youTubeVideoId) {
    return (
      <div
        ref={containerRef}
        className="relative w-full aspect-video bg-black text-white rounded-lg shadow-2xl overflow-hidden"
      >
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${youTubeVideoId}?autoplay=1&controls=1&rel=0`}
          title={videoTitle}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
        <div className="absolute top-0 left-0 p-2 bg-gradient-to-b from-black/70 to-transparent">
          <h2 className="text-sm font-semibold">{videoTitle}</h2>
        </div>
      </div>
    );
  }

  if (facebookVideoId) {
    return (
      <div
        ref={containerRef}
        className={
          isMobileDevice
            ? "video-player-container"
            : "relative w-full aspect-video bg-black text-white rounded-lg shadow-2xl overflow-hidden"
        }
      >
        <iframe
          className={
            isMobileDevice
              ? "w-full h-full border-0"
              : "absolute inset-0 max-w-2xl h-full mx-auto overflow-hidden"
          }
          src={`${
            isMobileDevice
              ? `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
                  videoUrl
                )}&show_text=false&appId=343576674949979`
              : `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
                  videoUrl
                )}&show_text=false&width=480&height=980&appId=343576674949979`
          }`}
          title={videoTitle}
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
        ></iframe>
        <div className="absolute top-0 left-0 p-2 bg-gradient-to-b from-black/70 to-transparent hidden sm:block">
          <h2 className="text-sm font-semibold">{videoTitle}</h2>
        </div>
      </div>
    );
  }

  if (tikTokVideoId) {
    return (
      <div
        ref={containerRef}
        className={
          isMobileDevice
            ? "video-player-container"
            : "relative w-full aspect-video bg-black text-white rounded-lg shadow-2xl overflow-hidden"
        }
      >
        <iframe
          className="absolute inset-0 w-full h-full tiktok-embed"
          src={`https://www.tiktok.com/embed/v2/${tikTokVideoId}`}
          title={videoTitle}
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
        ></iframe>
        <div className="absolute top-0 left-0 p-2 bg-gradient-to-b from-black/70 to-transparent">
          <h2 className="text-sm font-semibold">{videoTitle}</h2>
        </div>
      </div>
    );
  }

  return (
    <StyledContainer
      onClick={handleContainerClick}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      ref={containerRef}
    >
      {error && (
        <FirstPlayOverlay>
          <FirstPlayButton>{error}</FirstPlayButton>
        </FirstPlayOverlay>
      )}
      {!error && !wasFirstPlayed && !isLoadingHLS && (
        <FirstPlayOverlay>
          <FirstPlayButton>
            <FaPlay size={30} />
          </FirstPlayButton>
        </FirstPlayOverlay>
      )}
      {isLoadingHLS &&
        videoUrl?.includes(".m3u8") &&
        !isBufferReady &&
        !error && <Spinner />}
      {showIcon && (
        <IconOverlay>
          {showIcon === "play" && <FaPlay size={50} />}
          {showIcon === "pause" && <FaPause size={50} />}
          {showIcon === "replay" && <FaRedo size={50} />}
        </IconOverlay>
      )}
      <StyledPlayer
        playsInline
        preload="auto"
        ref={setElement}
        poster={
          match?.sport?.slug === "esports"
            ? banner_esport_timer
            : match?.sport?.slug === "football"
            ? banner_football_timer
            : match?.sport?.slug === "pool"
            ? banner_bida_timer
            : match?.sport?.slug === "tennis"
            ? banner_tennis_timer
            : match?.sport?.slug === "race"
            ? banner_racing_timer
            : match?.sport?.slug === "wwe"
            ? banner_boxing_timer
            : match?.sport?.slug === "basketball"
            ? banner_basketball_timer
            : match?.sport?.slug === "badminton"
            ? banner_badminton_timer
            : match?.sport?.slug === "volleyball"
            ? banner_volleyball_timer
            : banner_esport_timer
        }
      />
      {(countdownActive || videoUrl === "undefined") && !error && (
        <div
          className="absolute inset-0 flex items-center justify-start bg-black/70 text-white text-center p-8 md:p-2 pt-12 md:pt-12 z-10"
          style={{
            backgroundImage: `url(${
              match?.sport?.slug === "esports"
                ? banner_esport_timer
                : match?.sport?.slug === "football"
                ? banner_football_timer
                : match?.sport?.slug === "pool"
                ? banner_bida_timer
                : match?.sport?.slug === "tennis"
                ? banner_tennis_timer
                : match?.sport?.slug === "race"
                ? banner_racing_timer
                : match?.sport?.slug === "wwe"
                ? banner_boxing_timer
                : match?.sport?.slug === "basketball"
                ? banner_basketball_timer
                : match?.sport?.slug === "badminton"
                ? banner_badminton_timer
                : match?.sport?.slug === "volleyball"
                ? banner_volleyball_timer
                : banner_esport_timer
            })`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="relative w-full max-w-md px-4 md:p-4 bg-black/50 rounded-lg">
            <div className="flex items-center justify-between sm:mb-0 md:mb-4 w-full">
              <div className="flex flex-col items-center w-2/6">
                <img
                  src={match?.homeTeam?.logo ?? ""}
                  alt={match?.homeTeam?.name}
                  className="w-8 md:w-12 h-8 md:h-12 object-contain mb-1"
                />
                <span className="text-white text-[10px] md:text-xs font-medium truncate w-full">
                  {match?.homeTeam?.name ?? "Team A"}
                </span>
              </div>
              <div className="text-center">
                <div className="flex flex-col items-center md:items-start text-left mb-0 md:mb-2 gap-1 w-full">
                  <span className="text-white text-[10px] font-semibold md:text-sm truncate w-full">
                    {match?.league?.name ?? "N/A"}
                  </span>
                  <span className="text-white text-[10px] font-semibold md:text-sm">
                    {new Date(match?.startTime ?? "").toLocaleString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                      timeZone: "Asia/Ho_Chi_Minh",
                    })}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center w-2/6">
                <img
                  src={match?.awayTeam?.logo ?? ""}
                  alt={match?.awayTeam?.name}
                  className="w-8 md:w-12 h-8 md:h-12 object-contain mb-1"
                />
                <span className="text-white text-[10px] md:text-xs font-medium truncate w-full">
                  {match?.awayTeam?.name ?? "Team B"}
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-2 mb-1 md:mb-4">
              <span className="text-white font-semibold text-xs md:text-sm">
                Trận đấu sẽ bắt đầu sau
              </span>
            </div>
            <div className="flex flex-row justify-center items-center space-x-4 bg-gray-800 p-1 md:p-2 rounded">
              <div className="text-center">
                <span className="text-white text-sm md:text-2xl font-bold">
                  {timeRemaining.days}
                </span>
                <div className="text-white text-[10px] md:text-sm">Ngày</div>
              </div>
              <div className="text-center">
                <span className="text-white text-sm md:text-2xl font-bold">
                  {timeRemaining.hours}
                </span>
                <div className="text-white text-[10px] md:text-sm">Giờ</div>
              </div>
              <div className="text-center">
                <span className="text-white text-sm md:text-2xl font-bold">
                  {timeRemaining.minutes}
                </span>
                <div className="text-white text-[10px] md:text-sm">Phút</div>
              </div>
              <div className="text-center">
                <span className="text-white text-sm md:text-2xl font-bold">
                  {timeRemaining.seconds}
                </span>
                <div className="text-white text-[10px] md:text-sm">Giây</div>
              </div>
            </div>

            {activeBanners?.length > 0 && (
              <div className="md:flex justify-center gap-2 mt-4 hidden">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded text-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  XEM NGAY
                </button>
                <button
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded text-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  CƯỢC NGAY
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {activeBanners?.length > 0 && (
        <div
          className={
            isFullscreen
              ? "absolute bottom-4 md:bottom-8 xl:bottom-16 right-2 z-[1000]"
              : "absolute bottom-4 md:bottom-8 right-2 z-0"
          }
        >
          <div className="flex items-center gap-1">
            <button
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-2 rounded transition-colors text-[9px]"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              CƯỢC SV368
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-2 rounded transition-colors text-[9px]"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              CHIA SẺ NGAY
            </button>
          </div>
        </div>
      )}
      {activeBanners?.length > 0 && (
        <div
          className={
            isFullscreen
              ? "absolute bottom-0 left-0 right-0 z-[1000]"
              : "absolute bottom-0 left-0 right-0 z-100"
          }
        >
          <img
            src={filterBanners("INLINE", "LIVE_PAGE")?.imageUrl}
            alt="Ad Banner"
            className="object-cover w-full"
          />
        </div>
      )}
      <StyledControls
        isIOS={isIOS}
        onClick={handleControlsClick}
        style={{ opacity: showControls || isFullscreen ? 1 : 0 }}
      >
        <div>
          {playingState === "paused" && (
            <PlayPauseButton onClick={handlePlay}>
              <FaPlay size={14} />
            </PlayPauseButton>
          )}
          {playingState === "playing" && (
            <PlayPauseButton onClick={handlePause}>
              <FaPause size={14} />
            </PlayPauseButton>
          )}
          {playingState === "ended" && (
            <PlayPauseButton onClick={handlePlayAgain}>
              <FaRedo size={14} />
            </PlayPauseButton>
          )}
        </div>
        <Volume
          controller={controller}
          setShowControls={setShowControls}
          isIOS={isIOS}
        />
        <ProgressAndTimerContainer>
          {/* <Progress controller={controller} /> */}
          {/* <Timer controller={controller} /> */}
        </ProgressAndTimerContainer>
        <FullscreenButton onClick={handleToggleFullscreen}>
          {isFullscreen ? "]  [" : "[  ]"}
        </FullscreenButton>
        {/* <button
          onClick={handleSettings}
          aria-label="Settings"
          className="hover:text-red-500 transition-colors"
        >
          <Cog8ToothIcon className="w-5 h-5" />
        </button>
        {showSettings && qualityLevels.length > 0 && (
          <div className="absolute top-8 right-8 bg-black/90 text-white rounded-md shadow-lg p-2 z-10">
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => handleQualityChange(-1)}
                  className={`w-full text-left px-2 py-1 rounded hover:bg-red-500/50 ${
                    currentLevel === -1 ? "bg-red-500/70" : ""
                  }`}
                >
                  Auto
                </button>
              </li>
              {qualityLevels?.map((level) => (
                <li key={level.id}>
                  <button
                    onClick={() => handleQualityChange(level.id)}
                    className={`w-full text-left px-2 py-1 rounded ${
                      currentLevel === level.id ? "bg-red-500/70" : ""
                    }`}
                  >
                    {level.height}p
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )} */}
      </StyledControls>
      {/* {!isIOS && <StyledBanner />} */}
    </StyledContainer>
  );
};

export default Player;
