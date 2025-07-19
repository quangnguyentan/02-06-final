import React, { useState, useRef, useEffect, useCallback } from "react";
import Hls from "hls.js";
import {
  PlayCircleIconSolid,
  PauseCircleIconSolid,
  SpeakerWaveIconSolid,
  SpeakerXMarkIconSolid,
  ArrowsPointingIconSolid,
  ArrowsPointingOutIconSolid,
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

const VideoPlayer: React.FC<VideoPlayerProps> = ({
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
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.75);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [qualityLevels, setQualityLevels] = useState<
    { id: number; height: number }[]
  >([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCustomFullscreen, setIsCustomFullscreen] = useState(false);
  const [countdownActive, setCountdownActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<ExtendedVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const lastTouchTime = useRef<number>(0);
  const touchCount = useRef<number>(0);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const { hasUserInteracted, setHasUserInteracted } = useUserInteraction();
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevVideoUrl = useRef<string | undefined>(videoUrl);
  const lastKnownTime = useRef<number>(0);

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

  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const getIOSVersion = () => {
    const match = navigator.userAgent.match(/OS (\d+)_(\d+)/);
    return match ? parseFloat(`${match[1]}.${match[2]}`) : null;
  };

  const iosVersion = getIOSVersion();

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
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  const startControlsTimeout = useCallback(() => {
    if (
      showControls &&
      !showSettings &&
      !countdownActive &&
      !error &&
      !isLoading
    ) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(
        () => {
          setShowControls(false);
          setShowPlayButton(false);
        },
        isMobile ? 3000 : 2000
      );
    }
  }, [isMobile, showControls, showSettings, countdownActive, error, isLoading]);

  useEffect(() => {
    if (isPlaying && !isLoading && !error && !countdownActive) {
      startControlsTimeout();
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, isLoading, error, countdownActive, startControlsTimeout]);

  useEffect(() => {
    const handleOrientationChange = () => {
      if (
        videoRef.current &&
        !youTubeVideoId &&
        !facebookVideoId &&
        !tikTokVideoId &&
        isPlaying &&
        !countdownActive &&
        !error
      ) {
        const video = videoRef.current;
        // Store current time for non-live videos
        if (!isLive) {
          lastKnownTime.current = video.currentTime;
        }
        // Ensure audio state
        if (video.muted && !isMuted) {
          video.muted = false;
          if (video.muted) {
            setIsMuted(true);
            // setError(
            //   iosVersion && iosVersion < 16 && document.hidden
            //     ? "Âm thanh bị tắt do đang quay màn hình trên iOS < 16. Vui lòng tắt quay màn hình để bật âm thanh."
            //     : "Không thể bật âm thanh. Vui lòng kiểm tra cài đặt thiết bị."
            // );
          } else {
            setIsMuted(false);
          }
        }
        // Delay play attempt to allow Safari to stabilize
        setTimeout(() => {
          if (video.paused && isPlaying && video.readyState >= 2) {
            setIsLoading(true);
            video
              .play()
              .then(() => {
                setIsLoading(false);
                setShowControls(true);
                setShowPlayButton(false);
                // Restore position for non-live or sync to live edge
                if (isLive && hlsRef.current) {
                  seekToLiveEdge();
                } else if (!isLive && lastKnownTime.current) {
                  video.currentTime = lastKnownTime.current;
                }
              })
              .catch((err) => {
                console.error("Resume after orientation change:", err);
                setIsLoading(false);
                setShowPlayButton(true);
                setShowControls(true);
                // if (iosVersion && iosVersion < 16 && document.hidden) {
                //   setError(
                //     "Video bị tạm dừng do đang quay màn hình. Vui lòng tắt quay màn hình để tiếp tục."
                //   );
                // }
              });
          }
        }, 100);
        setShowControls(true);
        startControlsTimeout();
      }
    };

    window.addEventListener("orientationchange", handleOrientationChange);
    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, [
    isPlaying,
    // isMuted,
    isLive,
    // iosVersion,
    startControlsTimeout,
    youTubeVideoId,
    facebookVideoId,
    tikTokVideoId,
    countdownActive,
    // error,
  ]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || youTubeVideoId || facebookVideoId || tikTokVideoId) return;

    const handleVolumeChangeEvent = () => {
      setIsMuted(video.muted);
      setVolume(video.volume);
      setShowControls(true);
      startControlsTimeout();
    };

    video.addEventListener("volumechange", handleVolumeChangeEvent);
    return () => {
      video.removeEventListener("volumechange", handleVolumeChangeEvent);
    };
  }, [youTubeVideoId, facebookVideoId, tikTokVideoId, startControlsTimeout]);

  // Add a utility function to seek to the live edge
  const seekToLiveEdge = useCallback(() => {
    if (videoRef.current && isLive) {
      const seekable = videoRef.current.seekable;
      if (seekable.length > 0) {
        const liveEdge = seekable.end(seekable.length - 1);
        videoRef.current.currentTime = liveEdge;
      }
    }
  }, [isLive]);

  useEffect(() => {
    if (
      !videoRef.current ||
      !videoUrl ||
      youTubeVideoId ||
      facebookVideoId ||
      tikTokVideoId ||
      (iosVersion && videoUrl === prevVideoUrl.current)
    ) {
      return;
    }

    prevVideoUrl.current = videoUrl;
    const video = videoRef.current;
    video.playsInline = true;
    video.controls = false;
    const isM3u8 = videoUrl.endsWith(".m3u8");
    const isDash = videoUrl.endsWith(".mpd");
    const isHlsSupported = Hls.isSupported();
    const isNativeHlsSupported = video.canPlayType(
      "application/vnd.apple.mpegurl"
    );

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    video.src = "";

    setError(null);
    setIsLoading(true);
    video.muted = isMuted;
    video.autoplay = false;

    const handleWaiting = () => {
      setIsLoading(true);
    };
    const handleCanPlay = () => {
      setIsLoading(false);
      setShowControls(true);
      if (videoRef.current && isPlaying && videoRef.current.paused) {
        videoRef.current.play().catch((err) => {
          console.error("Auto-resume on canplay:", err);
          setShowPlayButton(true);
        });
        if (!isMuted && videoRef.current.muted) {
          videoRef.current.muted = false;
        }
      }
    };

    if (isM3u8 && isNativeHlsSupported && !isHlsSupported) {
      video.src = videoUrl;
      video.addEventListener("loadedmetadata", () => {
        setIsLive(isNaN(video.duration) || video.duration === Infinity);
      });
      video.addEventListener("waiting", handleWaiting);
      video.addEventListener("canplay", handleCanPlay);
    } else if (isM3u8 && isHlsSupported) {
      // const hls = new Hls({
      //   lowLatencyMode: true, // Optimize for low-latency streaming
      //   liveSyncDurationCount: 2, // Reduced for faster live edge sync
      //   maxLiveSyncPlaybackRate: 1.2, // Smoother catch-up to live edge
      // });
      const hls = new Hls({
        lowLatencyMode: true,
        liveSyncDurationCount: 1, // Reduce to 1 for faster sync
        maxLiveSyncPlaybackRate: 1.1, // Slightly faster catch-up
        enableWorker: true, // Use Web Worker for better performance
        startLevel: -1, // Auto-select quality based on bandwidth
      });
      hlsRef.current = hls;
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      video.playsInline = true;

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLive(hls.levels.some((level) => level.details?.live));
        setQualityLevels(
          hls.levels.map((level, index) => ({
            id: index,
            height: level.height || 720,
          }))
        );
        setIsLoading(false);
        setShowControls(true);
        if (isLive && isPlaying) {
          seekToLiveEdge();
        }
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        setCurrentLevel(data.level);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          // setError(`HLS Error: ${data.type}. Please try again.`);
          setIsLoading(false);
          hls.destroy();
          hlsRef.current = null;
        }
      });

      video.addEventListener("waiting", handleWaiting);
      video.addEventListener("canplay", handleCanPlay);
    } else if (isDash) {
      import("dashjs").then((dashjs) => {
        const player = dashjs.MediaPlayer().create();
        player.initialize(video, videoUrl, autoPlay);
        player.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED, () => {
          setIsLive(player.isDynamic());
          setIsLoading(false);
          setShowControls(true);
        });
        player.on(dashjs.MediaPlayer.events.ERROR, (e) => {
          // setError(`DASH Error: ${e.error}. Please try again.`);
          setIsLoading(false);
        });
        video.addEventListener("waiting", handleWaiting);
        video.addEventListener("canplay", handleCanPlay);
        return () => {
          player.reset();
        };
      });
    } else {
      video.src = videoUrl;
      video.addEventListener("loadedmetadata", () => {
        setIsLive(isNaN(video.duration) || video.duration === Infinity);
        if (isYouTubeStream && !video.videoWidth && !video.videoHeight) {
          video.style.backgroundColor = "black";
        }
      });
      video.addEventListener("waiting", handleWaiting);
      video.addEventListener("canplay", handleCanPlay);
      video.addEventListener("error", () => {
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
      });
    }

    const handleFullscreenChange = () => {
      const video = videoRef.current;
      if (!video) return;

      const isCurrentlyFullscreen =
        !!document.fullscreenElement || !!video.webkitDisplayingFullscreen;
      if (!isCustomFullscreen) {
        setIsFullscreen(isCurrentlyFullscreen);
      }
      if (!isCurrentlyFullscreen && !isCustomFullscreen) {
        setIsCustomFullscreen(false);
      }
      if (isPlaying && video.paused) {
        setTimeout(() => {
          video.play().catch((err) => {
            console.error("Auto-resume after fullscreen change:", err);
            setShowPlayButton(true);
          });
        }, 500);
      }
      if (!isMuted && video.muted) {
        video.muted = false;
      }
      setShowControls(true);
      startControlsTimeout();
    };

    const handlePause = () => {
      if (
        videoRef.current &&
        (isFullscreen || isCustomFullscreen) &&
        isPlaying &&
        videoRef.current.paused
      ) {
        const isDevTools =
          /HeadlessChrome|PhantomJS/.test(navigator.userAgent) ||
          window.navigator.webdriver;
        if (iosVersion && iosVersion < 16 && document.hidden && !isDevTools) {
          // setError(
          //   "Video bị tạm dừng do đang quay màn hình. Vui lòng tắt quay màn hình để tiếp tục."
          // );
          setIsPlaying(false);
          setShowPlayButton(true);
          setShowControls(true);
        } else {
          // Attempt to resume immediately
          setTimeout(() => {
            if (videoRef.current?.paused && isPlaying) {
              videoRef.current.play().catch((err) => {
                console.error("Auto-resume on pause:", err);
                setIsPlaying(false);
                setShowPlayButton(true);
                setShowControls(true);
              });
            }
          }, 500);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        videoRef.current &&
        isPlaying &&
        videoRef.current.paused
      ) {
        const isDevTools =
          /HeadlessChrome|PhantomJS/.test(navigator.userAgent) ||
          window.navigator.webdriver;
        if (!document.hidden || isDevTools) {
          setTimeout(() => {
            videoRef.current?.play().catch((err) => {
              console.error("Auto-resume on visibility change:", err);
              setShowPlayButton(true);
            });
            if (!isMuted && videoRef.current?.muted) {
              videoRef.current.muted = false;
            }
          }, 500);
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    video.addEventListener("pause", handlePause);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    const handleWrapperClick = (e: MouseEvent) => {
      e.stopPropagation();
      if (
        videoRef.current &&
        !youTubeVideoId &&
        !facebookVideoId &&
        !tikTokVideoId &&
        !isMobile &&
        (isFullscreen || isCustomFullscreen)
      ) {
        togglePlay();
      }
    };

    const handleVideoTouch = (e: TouchEvent) => {
      if (e.cancelable) {
        e.preventDefault();
      }
      if (e.type === "touchstart") {
        handleTouchStart(e as any);
      } else if (e.type === "touchend") {
        handleTouchEnd(e);
      }
    };

    if (videoWrapperRef.current) {
      videoWrapperRef.current.addEventListener("click", handleWrapperClick, {
        capture: true,
      });
      videoWrapperRef.current.addEventListener("touchstart", handleVideoTouch);
      videoWrapperRef.current.addEventListener("touchend", handleVideoTouch);
    }
    if (videoRef.current) {
      videoRef.current.addEventListener("touchstart", handleVideoTouch);
      videoRef.current.addEventListener("touchend", handleVideoTouch);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.src = "";
        videoRef.current.removeEventListener("loadedmetadata", () => {});
        videoRef.current.removeEventListener("waiting", handleWaiting);
        videoRef.current.removeEventListener("canplay", handleCanPlay);
        videoRef.current.removeEventListener("error", () => {});
        videoRef.current.removeEventListener("pause", handlePause);
        videoRef.current.removeEventListener("touchstart", handleVideoTouch);
        videoRef.current.removeEventListener("touchend", handleVideoTouch);
      }
      if (videoWrapperRef.current) {
        videoWrapperRef.current.removeEventListener(
          "click",
          handleWrapperClick
        );
        videoWrapperRef.current.removeEventListener(
          "touchstart",
          handleVideoTouch
        );
        videoWrapperRef.current.removeEventListener(
          "touchend",
          handleVideoTouch
        );
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
    };
  }, [
    videoUrl,
    isYouTubeStream,
    youTubeVideoId,
    facebookVideoId,
    tikTokVideoId,
    isMobile,
    autoPlay,
    isPlaying,
  ]);

  useEffect(() => {
    if (
      videoRef.current &&
      !youTubeVideoId &&
      !facebookVideoId &&
      !tikTokVideoId &&
      isPlaying
    ) {
      videoRef.current.muted = false;
      setIsMuted(false);
    }
  }, [isPlaying, youTubeVideoId, facebookVideoId, tikTokVideoId]);

  useEffect(() => {
    if (
      videoRef.current &&
      !youTubeVideoId &&
      !facebookVideoId &&
      !tikTokVideoId
    ) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted, youTubeVideoId, facebookVideoId, tikTokVideoId]);

  useEffect(() => {
    if (isCustomFullscreen && playerRef.current && videoRef.current) {
      playerRef.current.style.position = "fixed";
      playerRef.current.style.top = "0";
      playerRef.current.style.left = "0";
      playerRef.current.style.width = "100%";
      playerRef.current.style.height = "100%";
      playerRef.current.style.zIndex = "999";
      playerRef.current.style.backgroundColor = "black";
      document.body.style.overflow = "hidden";

      videoRef.current.style.width = "100%";
      videoRef.current.style.height = "100%";
      videoRef.current.style.objectFit = "contain";
      videoRef.current.style.position = "absolute";
      videoRef.current.style.top = "50%";
      videoRef.current.style.left = "50%";
      videoRef.current.style.transform = "translate(-50%, -50%)";

      if (isMobile) {
        window.scrollTo(0, 0);
        document.body.style.position = "fixed";
        document.body.style.width = "100%";
      }
    } else if (playerRef.current && videoRef.current) {
      playerRef.current.style.position = "";
      playerRef.current.style.top = "";
      playerRef.current.style.left = "";
      playerRef.current.style.width = "";
      playerRef.current.style.height = "";
      playerRef.current.style.zIndex = "999";
      playerRef.current.style.backgroundColor = "";
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";

      videoRef.current.style.width = "";
      videoRef.current.style.height = "";
      videoRef.current.style.objectFit = "";
      videoRef.current.style.position = "";
      videoRef.current.style.top = "";
      videoRef.current.style.left = "";
      videoRef.current.style.transform = "";
    }
  }, [isCustomFullscreen, isMobile]);

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const togglePlay = useCallback(() => {
    setShowSettings(false);
    if (
      videoRef.current &&
      !youTubeVideoId &&
      !facebookVideoId &&
      !tikTokVideoId
    ) {
      const video = videoRef.current;
      if (video.paused || video.ended) {
        video.muted = false;
        setIsMuted(false);
        video
          .play()
          .then(() => {
            setIsPlaying(true);
            setShowPlayButton(false);
            setHasUserInteracted(true);
            setShowControls(true);
            startControlsTimeout();
            if (isLive && hlsRef.current) {
              seekToLiveEdge();
            }
          })
          .catch((err) => {
            console.error("Play error:", err);
            setIsLoading(false);
            setShowControls(true);
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
          });
      } else {
        video.pause();
        setIsPlaying(false);
        setShowControls(true);
        setShowPlayButton(true);
        startControlsTimeout();
      }
    }
  }, [
    facebookVideoId,
    tikTokVideoId,
    youTubeVideoId,
    setHasUserInteracted,
    match?.startTime,
    match?.status,
    startControlsTimeout,
    isLive,
  ]);

  const toggleMute = () => {
    if (
      videoRef.current &&
      !youTubeVideoId &&
      !facebookVideoId &&
      !tikTokVideoId
    ) {
      const video = videoRef.current;
      const newMutedState = !video.muted;
      video.muted = newMutedState;
      setIsMuted(newMutedState);
      if (!newMutedState && video.muted) {
        setIsMuted(true);
        // setError(
        //   iosVersion && iosVersion < 16 && document.hidden
        //     ? "Âm thanh bị tắt do đang quay màn hình trên iOS < 16. Vui lòng tắt quay màn hình để bật âm thanh."
        //     : "Không thể bật âm thanh. Vui lòng kiểm tra cài đặt thiết bị."
        // );
      }
      setHasUserInteracted(true);
      setShowControls(true);
      startControlsTimeout();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (isMuted && newVolume > 0) setIsMuted(false);
    if (!isMuted && newVolume === 0) setIsMuted(true);
    setShowControls(true);
    startControlsTimeout();
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (!isLive) {
        lastKnownTime.current = videoRef.current.currentTime;
      }
    }
  };

  const handleLoadedMetadata = () => {
    setIsLoading(false);
    setShowControls(true);
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLive(
        isNaN(videoRef.current.duration) ||
          videoRef.current.duration === Infinity
      );
    }
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (video && !youTubeVideoId && !facebookVideoId && !tikTokVideoId) {
      if (!isFullscreen) {
        if (video.webkitEnterFullscreen) {
          video.webkitEnterFullscreen();
          setTimeout(() => {
            if (video.muted && !isMuted) {
              video.muted = false;
              if (video.muted) {
                setIsMuted(true);
                // setError(
                //   iosVersion && iosVersion < 16 && document.hidden
                //     ? "Âm thanh bị tắt do đang quay màn hình trên iOS < 16. Vui lòng tắt quay màn hình để bật âm thanh."
                //     : "Không thể bật âm thanh. Vui lòng kiểm tra cài đặt thiết bị."
                // );
              } else {
                setIsMuted(false);
              }
            }
            if (video.paused && isPlaying) {
              video
                .play()
                .then(() => {
                  if (isLive && hlsRef.current) {
                    seekToLiveEdge();
                  } else if (!isLive && lastKnownTime.current) {
                    video.currentTime = lastKnownTime.current;
                  }
                })
                .catch((err) => {
                  console.error("Resume after fullscreen:", err);
                  setIsPlaying(false);
                  setShowPlayButton(true);
                });
            }
          }, 100);
        } else if (video.requestFullscreen) {
          video.requestFullscreen().catch((err) => {
            console.error(`Fullscreen error (standard): ${err.message}`);
            setIsCustomFullscreen(true);
          });
        } else if (video.msRequestFullscreen) {
          video.msRequestFullscreen();
        }
        setIsFullscreen(true);
        setShowControls(true);
        startControlsTimeout();
      } else {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen();
        } else if (video.webkitExitFullscreen) {
          video.webkitExitFullscreen();
        }
        setIsCustomFullscreen(false);
        setIsFullscreen(false);
        setShowControls(true);
        startControlsTimeout();
      }
    }
  };

  const handleCustomFullscreen = useCallback(() => {
    const video = videoRef.current;
    if (video && !youTubeVideoId && !facebookVideoId && !tikTokVideoId) {
      if (!isFullscreen && !isCustomFullscreen) {
        if (!isMobile && playerRef.current?.requestFullscreen) {
          playerRef.current.requestFullscreen().catch((err) => {
            console.error(`Custom Fullscreen error: ${err.message}`);
            setIsCustomFullscreen(true);
          });
        } else {
          setIsCustomFullscreen(true);
        }
        setShowControls(true);
        startControlsTimeout();
        if (isMobile) {
          window.scrollTo(0, 0);
        }
        if (isPlaying && video.paused) {
          setTimeout(() => {
            video.play().catch((err) => {
              console.error("Resume after custom fullscreen:", err);
              setShowPlayButton(true);
            });
            if (isLive && hlsRef.current) {
              seekToLiveEdge();
            }
          }, 500);
        }
        if (!isMuted && video.muted) {
          video.muted = false;
        }
      } else {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen();
        } else if (video.webkitExitFullscreen) {
          video.webkitExitFullscreen();
        }
        setIsCustomFullscreen(false);
        setIsFullscreen(false);
        setShowControls(true);
        startControlsTimeout();
      }
    }
  }, [
    isFullscreen,
    isCustomFullscreen,
    isMobile,
    startControlsTimeout,
    isPlaying,
    isMuted,
    isLive,
  ]);

  const handleSettings = () => {
    setShowSettings(!showSettings);
    setShowControls(true);
    startControlsTimeout();
  };

  const handleQualityChange = (levelId: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelId;
      setCurrentLevel(levelId);
      setShowSettings(false);
      setShowControls(true);
      startControlsTimeout();
    }
  };

  const handleVideoClick = () => {
    if (
      videoRef.current &&
      !youTubeVideoId &&
      !facebookVideoId &&
      !tikTokVideoId
    ) {
      if (!isMobile) {
        togglePlay();
      } else {
        setShowPlayButton(true);
        setShowControls(true);
        startControlsTimeout();
      }
    }
  };

  const lastProcessedTouch = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile || youTubeVideoId || facebookVideoId || tikTokVideoId) return;

    if (e.cancelable) {
      e.preventDefault();
    }
    e.stopPropagation();
    const currentTime = new Date().getTime();
    if (currentTime - lastProcessedTouch.current < 100) return;
    const tapLength = currentTime - lastTouchTime.current;
    const touchX = e.touches[0]?.clientX;
    const screenWidth = window.innerWidth;
    const isLeftOrRight =
      iosVersion && iosVersion < 16.0
        ? touchX < screenWidth * 0.4 || touchX > screenWidth * 0.6
        : true;

    if (isLeftOrRight) {
      touchCount.current += 1;
      setShowControls(true);
      setShowPlayButton(isPlaying ? false : true);
      clearTimeout(controlsTimeoutRef.current as NodeJS.Timeout);
      if (isPlaying && !showSettings && !countdownActive && !error) {
        startControlsTimeout();
      }
      const check = 2;
      if (tapLength < 300 && tapLength > 0 && touchCount.current >= check) {
        handleCustomFullscreen();
        window.scrollTo(0, 0);
        touchCount.current = 0;
      }

      setTimeout(() => {
        touchCount.current = 0;
      }, 300);
    }

    lastTouchTime.current = currentTime;
    lastProcessedTouch.current = currentTime;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (e.cancelable) {
      e.preventDefault();
    }
    e.stopPropagation();
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isMobile) {
        setShowControls(true);
        startControlsTimeout();
      }
    },
    [isMobile, startControlsTimeout]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && (isCustomFullscreen || isFullscreen)) {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch((err) => {
            console.error(`Exit fullscreen error: ${err.message}`);
          });
        } else if (videoRef.current?.webkitExitFullscreen) {
          videoRef.current.webkitExitFullscreen();
        }
        setIsCustomFullscreen(false);
        setIsFullscreen(false);
        setShowControls(true);
        startControlsTimeout();
      }
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        togglePlay();
      }
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        handleCustomFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    isCustomFullscreen,
    isFullscreen,
    togglePlay,
    handleCustomFullscreen,
    startControlsTimeout,
  ]);

  if (!videoUrl || videoUrl === "undefined") {
    return (
      <div className="relative w-full aspect-video bg-black text-white rounded-lg shadow-2xl flex items-center justify-center">
        <div
          className={
            isCustomFullscreen
              ? "absolute inset-0 flex items-center justify-start bg-black/70 text-white text-center p-8 md:p-2 pt-12 md:pt-12 z-10"
              : "absolute inset-0 flex items-center justify-start bg-black/70 text-white text-center p-8 md:p-2 pt-12 md:pt-12 z-0"
          }
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
                      // year: "numeric",
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
        ref={playerRef}
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
        ref={playerRef}
        className={
          isMobile
            ? "video-player-container"
            : "relative w-full aspect-video bg-black text-white rounded-lg shadow-2xl overflow-hidden"
        }
      >
        <iframe
          className={
            isMobile
              ? "w-full h-full border-0"
              : "absolute inset-0 max-w-2xl h-full mx-auto overflow-hidden"
          }
          src={`${
            isMobile
              ? ` https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
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
        ref={playerRef}
        className={
          isMobile
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
    <div
      ref={playerRef}
      className="relative w-full aspect-video bg-black text-white rounded-lg shadow-2xl overflow-hidden group"
      onClick={(e) => e.stopPropagation()}
      onMouseMove={isMobile ? undefined : handleMouseMove}
    >
      <div
        ref={videoWrapperRef}
        className="video-wrapper w-full h-full"
        onClick={handleVideoClick}
        onTouchStart={isMobile ? handleTouchStart : undefined}
      >
        <video
          ref={videoRef}
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
          className="video-player w-full h-full object-contain"
          onDoubleClick={isMobile ? undefined : handleFullscreen}
          onPlay={() => {
            setIsPlaying(true);
            setShowControls(true);
            setShowPlayButton(false);
            startControlsTimeout();
          }}
          onPause={() => {
            if (!isPlaying) {
              setShowControls(true);
              setShowPlayButton(true);
            }
          }}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onVolumeChange={() => {
            if (videoRef.current) {
              setVolume(videoRef.current.volume);
              setIsMuted(videoRef.current.muted);
            }
          }}
          autoPlay={false}
          playsInline
        >
          {videoUrl && (
            <source
              src={videoUrl}
              type={
                mimeType === "auto"
                  ? videoUrl.endsWith(".m3u8")
                    ? "application/x-mpegURL"
                    : videoUrl.endsWith(".mpd")
                    ? "application/dash+xml"
                    : videoUrl.endsWith(".mp3")
                    ? "audio/mpeg"
                    : videoUrl.endsWith(".webm")
                    ? "video/webm"
                    : videoUrl.endsWith(".ogg")
                    ? "video/ogg"
                    : "video/mp4"
                  : mimeType
              }
            />
          )}
          Your browser does not support the video tag.
        </video>
        {isCustomFullscreen && activeBanners?.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 z-[1000]">
            <img
              src={filterBanners("INLINE", "LIVE_PAGE")?.imageUrl}
              alt="Ad Banner"
              className="object-cover w-full"
            />
          </div>
        )}
      </div>
      {isLoading && !error && !countdownActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="w-12 h-12 border-4 border-t-4 border-t-red-500 border-gray-200 rounded-full animate-spin"></div>
        </div>
      )}
      {showPlayButton && isMobile && !isPlaying && !showControls && (
        <button
          onClick={togglePlay}
          aria-label={videoRef.current?.paused ? "Play" : "Pause"}
          className="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-black/70 transition-colors z-50"
        >
          <PlayCircleIconSolid className="w-16 h-16 text-white/80 hover:text-white" />
        </button>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-red-500 text-center p-4 z-50">
          <p>{error}</p>
        </div>
      )}

      {!isPlaying &&
        posterUrl &&
        !error &&
        !showPlayButton &&
        !countdownActive &&
        !isLoading && (
          <button
            onClick={togglePlay}
            aria-label="Play video"
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors z-50"
          >
            <PlayCircleIconSolid className="w-16 h-16" />
          </button>
        )}
      {isPlaying && !showPlayButton && !isMobile && (
        <button
          onClick={togglePlay}
          aria-label={videoRef.current?.paused ? "Play" : "Pause"}
          className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors opacity-0 z-0"
        >
          {isPlaying ? (
            <PauseCircleIconSolid className="w-16 h-16" />
          ) : (
            <PlayCircleIconSolid className="w-16 h-16" />
          )}
        </button>
      )}
      {!isPlaying && showPlayButton && !isMobile && (
        <button
          onClick={togglePlay}
          aria-label={videoRef.current?.paused ? "Play" : "Pause"}
          className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors opacity-100 z-0"
        >
          {isPlaying ? (
            <PauseCircleIconSolid className="w-16 h-16" />
          ) : (
            <PlayCircleIconSolid className="w-16 h-16" />
          )}
        </button>
      )}
      {(countdownActive || videoUrl === "undefined") && !error && (
        <div
          className={
            isCustomFullscreen
              ? "absolute inset-0 flex items-center justify-start bg-black/70 text-white text-center p-8 md:p-2 pt-12 md:pt-12 z-10"
              : "absolute inset-0 flex items-center justify-start bg-black/70 text-white text-center p-8 md:p-2 pt-12 md:pt-12 z-0"
          }
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
                      // year: "numeric",
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
            isCustomFullscreen
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
      <div
        className={
          isCustomFullscreen
            ? `absolute top-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-50 ${
                !showControls ? "hidden" : ""
              }`
            : `absolute top-0 left-0 right-0 p-1 bg-gradient-to-t from-black/40 via-black/80 to-transparent z-10 ${
                !showControls ? "hidden" : ""
              }`
        }
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={togglePlay}
              aria-label={videoRef.current?.paused ? "Play" : "Pause"}
              className="hover:text-red-500 transition-colors"
            >
              {!videoRef.current?.paused ? (
                <PauseCircleIconSolid className="w-6 h-6" />
              ) : (
                <PlayCircleIconSolid className="w-6 h-6" />
              )}
            </button>
            <div className="flex items-center group/volume">
              <button
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleMute();
                }}
                aria-label={isMuted ? "Unmute" : "Mute"}
                className="hover:text-red-500 transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <SpeakerXMarkIconSolid className="w-5 h-5" />
                ) : (
                  <SpeakerWaveIconSolid className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 ml-1 accent-red-500 cursor-pointer opacity-0 group-hover/volume:opacity-100 sm:opacity-100 transition-opacity"
                aria-label="Volume"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 relative">
            <button
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
            )}
            <button
              onClick={handleCustomFullscreen}
              aria-label={
                isCustomFullscreen
                  ? "Exit Custom Fullscreen"
                  : "Custom Fullscreen"
              }
              className="transition-colors"
            >
              <ArrowsPointingIconSolid
                className={`w-5 h-5 ${isCustomFullscreen ? "rotate-45" : ""}`}
              />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleFullscreen();
              }}
              aria-label="Native Fullscreen"
              className="transition-colors"
            >
              <ArrowsPointingOutIconSolid className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
