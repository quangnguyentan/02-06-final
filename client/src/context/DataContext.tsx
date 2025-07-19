import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState } from "react";
import { Match } from "@/types/match.types";
import { Replay } from "@/types/replay.types";
import { Sport } from "@/types/sport.types";
import { VideoReels } from "@/types/videoReel.type";
import { Banner } from "@/types/banner.types";
import { setInitialLoadComplete, isInitialLoadComplete } from "@/lib/helper";

const production = "https://sv.hoiquan.live";
const development = "http://localhost:8080";
const API_BASE_URL =
  import.meta.env.VITE_NODE_ENV === "production" ? production : development;

const fetchData = async (url: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(`${API_BASE_URL}${url}`, {
      signal: controller.signal,
      credentials: "include",
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
    return res.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error instanceof Error ? error : new Error("Unknown fetch error");
  }
};

const fetchMatches = () => fetchData("/api/matches");
const fetchReplays = () => fetchData("/api/replays");
const fetchSports = () => fetchData("/api/sports");
const fetchVideoReels = () => fetchData("/api/video-reels");
const fetchBanners = () => fetchData("/api/banners");

interface DataContextType {
  matchData: Match[] | undefined;
  replayData: Replay[] | undefined;
  sportData: Sport[] | undefined;
  videoReelData: VideoReels[] | undefined;
  bannerData: Banner[] | undefined;
  loading: boolean;
  error: Error | null;
  refetchData: () => Promise<void>;
  prefetchData: (endpoint: string) => void;
  initialLoadComplete: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const useMatches = () =>
  useQuery<Match[]>({
    queryKey: ["matches"],
    queryFn: fetchMatches,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

const useReplays = () =>
  useQuery<Replay[]>({
    queryKey: ["replays"],
    queryFn: fetchReplays,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

const useSports = () =>
  useQuery<Sport[]>({
    queryKey: ["sports"],
    queryFn: fetchSports,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

const useVideoReels = () =>
  useQuery<VideoReels[]>({
    queryKey: ["videoReels"],
    queryFn: fetchVideoReels,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

const useBanners = () =>
  useQuery<Banner[]>({
    queryKey: ["banners"],
    queryFn: fetchBanners,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

const DataProviderInner: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();
  const {
    data: matchData = [],
    isLoading: matchLoading,
    error: matchError,
  } = useMatches();
  const {
    data: replayData = [],
    isLoading: replayLoading,
    error: replayError,
  } = useReplays();
  const {
    data: sportData = [],
    isLoading: sportLoading,
    error: sportError,
  } = useSports();
  const {
    data: videoReelData = [],
    isLoading: videoReelLoading,
    error: videoReelError,
  } = useVideoReels();
  const {
    data: bannerData = [],
    isLoading: bannerLoading,
    error: bannerError,
  } = useBanners();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [initialLoadComplete, setIsInitialLoadComplete] = useState(
    isInitialLoadComplete()
  );

  const loading =
    matchLoading ||
    replayLoading ||
    sportLoading ||
    videoReelLoading ||
    bannerLoading;
  const error =
    matchError || replayError || sportError || videoReelError || bannerError;

  // Set initial load complete when data fetching is complete
  useEffect(() => {
    if (!loading && !error) {
      setInitialLoadComplete(true); // Persist to localStorage
      setIsInitialLoadComplete(true); // Update React state
    }
  }, [loading, error]);

  useEffect(() => {
    const wsUrl =
      import.meta.env.VITE_NODE_ENV === "production"
        ? "wss://sv.hoiquan.live/ws"
        : "ws://localhost:8080/ws";
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log(
        "WebSocket connected at",
        new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
      );
    };

    websocket.onmessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      console.log(
        "Received WebSocket message at",
        new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }),
        message
      );
      if (message.type === "data_updated") {
        queryClient.refetchQueries({ queryKey: [message.endpoint.slice(1)] });
      }
    };

    websocket.onclose = (event: CloseEvent) => {
      console.log(
        "WebSocket disconnected at",
        new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }),
        "Code:",
        event.code,
        "Reason:",
        event.reason
      );
      setTimeout(() => setWs(new WebSocket(wsUrl)), 5000);
    };

    websocket.onerror = (error: Event) => {
      console.error(
        "WebSocket error at",
        new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }),
        (error as ErrorEvent).message || "Unknown error"
      );
    };

    setWs(websocket);

    return () => {
      websocket.close();
      setWs(null);
    };
  }, [queryClient]);

  const refetchData = async () => {
    await queryClient.refetchQueries({
      queryKey: ["matches", "replays", "sports", "videoReels", "banners"],
    });
  };

  const prefetchData = (endpoint: string) => {
    const endpointMap: Record<string, () => Promise<any>> = {
      "/api/matches": fetchMatches,
      "/api/replays": fetchReplays,
      "/api/sports": fetchSports,
      "/api/video-reels": fetchVideoReels,
      "/api/banners": fetchBanners,
    };

    const queryFn = endpointMap[endpoint];
    if (typeof queryFn === "function") {
      queryClient.prefetchQuery({
        queryKey: [endpoint.slice(1)],
        queryFn,
      });
    } else {
      console.warn(`No prefetch function defined for endpoint: ${endpoint}`);
    }
  };

  return (
    <DataContext.Provider
      value={{
        matchData,
        replayData,
        sportData,
        videoReelData,
        bannerData,
        loading,
        error: error instanceof Error ? error : null,
        refetchData,
        prefetchData,
        initialLoadComplete,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <DataProviderInner>{children}</DataProviderInner>
    </QueryClientProvider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
// import {
//   QueryClient,
//   QueryClientProvider,
//   useQuery,
//   useQueryClient,
// } from "@tanstack/react-query";
// import { createContext, useContext, useEffect, useState } from "react";
// import { Match } from "@/types/match.types";
// import { Replay } from "@/types/replay.types";
// import { Sport } from "@/types/sport.types";
// import { setInitialLoadComplete, isInitialLoadComplete } from "@/lib/helper";

// const production = "https://sv.hoiquan.live";
// const development = "http://localhost:8080";
// const API_BASE_URL =
//   import.meta.env.VITE_NODE_ENV === "production" ? production : development;

// const fetchData = async (url: string) => {
//   const controller = new AbortController();
//   const timeoutId = setTimeout(() => controller.abort(), 10000);
//   try {
//     const res = await fetch(`${API_BASE_URL}${url}`, {
//       signal: controller.signal,
//       credentials: "include",
//     });
//     clearTimeout(timeoutId);
//     if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
//     return res.json();
//   } catch (error) {
//     clearTimeout(timeoutId);
//     throw error instanceof Error ? error : new Error("Unknown fetch error");
//   }
// };

// const fetchMatches = () => fetchData("/api/matches");
// const fetchReplays = () => fetchData("/api/replays");
// const fetchSports = () => fetchData("/api/sports");

// interface DataContextType {
//   matchData: Match[] | undefined;
//   replayData: Replay[] | undefined;
//   sportData: Sport[] | undefined;
//   loading: boolean;
//   error: Error | null;
//   refetchData: () => Promise<void>;
//   prefetchData: (endpoint: string) => void;
//   initialLoadComplete: boolean;
// }

// const DataContext = createContext<DataContextType | undefined>(undefined);

// const useMatches = () =>
//   useQuery<Match[]>({
//     queryKey: ["matches"],
//     queryFn: fetchMatches,
//     staleTime: 5 * 60 * 1000, // 5 minutes
//   });

// const useReplays = () =>
//   useQuery<Replay[]>({
//     queryKey: ["replays"],
//     queryFn: fetchReplays,
//     staleTime: 5 * 60 * 1000, // 5 minutes
//   });

// const useSports = () =>
//   useQuery<Sport[]>({
//     queryKey: ["sports"],
//     queryFn: fetchSports,
//     staleTime: 60 * 60 * 1000, // 1 hour
//   });

// const DataProviderInner: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const queryClient = useQueryClient();
//   const {
//     data: matchData = [],
//     isLoading: matchLoading,
//     error: matchError,
//   } = useMatches();
//   const {
//     data: replayData = [],
//     isLoading: replayLoading,
//     error: replayError,
//   } = useReplays();
//   const {
//     data: sportData = [],
//     isLoading: sportLoading,
//     error: sportError,
//   } = useSports();
//   const [ws, setWs] = useState<WebSocket | null>(null);
//   const [initialLoadComplete, setIsInitialLoadComplete] = useState(
//     isInitialLoadComplete()
//   );

//   const loading = matchLoading || replayLoading || sportLoading;
//   const error = matchError || replayError || sportError;

//   // Set initial load complete when data fetching is complete
//   useEffect(() => {
//     if (!loading && !error) {
//       setInitialLoadComplete(true); // Persist to localStorage
//       setIsInitialLoadComplete(true); // Update React state
//     }
//   }, [loading, error]);

//   useEffect(() => {
//     const wsUrl =
//       import.meta.env.VITE_NODE_ENV === "production"
//         ? "wss://sv.hoiquan.live/ws"
//         : "ws://localhost:8080/ws";
//     const websocket = new WebSocket(wsUrl);

//     websocket.onopen = () => {
//       console.log(
//         "WebSocket connected at",
//         new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
//       );
//     };

//     websocket.onmessage = (event: MessageEvent) => {
//       const message = JSON.parse(event.data);
//       console.log(
//         "Received WebSocket message at",
//         new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }),
//         message
//       );
//       if (message.type === "data_updated") {
//         queryClient.refetchQueries({ queryKey: [message.endpoint.slice(1)] });
//       }
//     };

//     websocket.onclose = (event: CloseEvent) => {
//       console.log(
//         "WebSocket disconnected at",
//         new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }),
//         "Code:",
//         event.code,
//         "Reason:",
//         event.reason
//       );
//       setTimeout(() => setWs(new WebSocket(wsUrl)), 5000);
//     };

//     websocket.onerror = (error: Event) => {
//       console.error(
//         "WebSocket error at",
//         new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }),
//         (error as ErrorEvent).message || "Unknown error"
//       );
//     };

//     setWs(websocket);

//     return () => {
//       websocket.close();
//       setWs(null);
//     };
//   }, [queryClient]);

//   const refetchData = async () => {
//     await queryClient.refetchQueries({
//       queryKey: ["matches", "replays", "sports"],
//     });
//   };

//   const prefetchData = (endpoint: string) => {
//     const endpointMap: Record<string, () => Promise<any>> = {
//       "/api/matches": fetchMatches,
//       "/api/replays": fetchReplays,
//       "/api/sports": fetchSports,
//     };

//     const queryFn = endpointMap[endpoint];
//     if (typeof queryFn === "function") {
//       queryClient.prefetchQuery({
//         queryKey: [endpoint.slice(1)],
//         queryFn,
//       });
//     } else {
//       console.warn(`No prefetch function defined for endpoint: ${endpoint}`);
//     }
//   };

//   return (
//     <DataContext.Provider
//       value={{
//         matchData,
//         replayData,
//         sportData,
//         loading,
//         error: error instanceof Error ? error : null,
//         refetchData,
//         prefetchData,
//         initialLoadComplete,
//       }}
//     >
//       {children}
//     </DataContext.Provider>
//   );
// };

// export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const queryClient = new QueryClient();
//   return (
//     <QueryClientProvider client={queryClient}>
//       <DataProviderInner>{children}</DataProviderInner>
//     </QueryClientProvider>
//   );
// };

// export const useData = () => {
//   const context = useContext(DataContext);
//   if (!context) {
//     throw new Error("useData must be used within a DataProvider");
//   }
//   return context;
// };
