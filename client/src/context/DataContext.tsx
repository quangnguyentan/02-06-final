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
// import { VideoReels } from "@/types/videoReel.type";
// import { Banner } from "@/types/banner.types";
// import { setInitialLoadComplete, isInitialLoadComplete } from "@/lib/helper";

// // const production = "https://sv.hoiquan.live";
// const production = "http://51.79.181.110:8080";

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
//     clearTimeout(timeoutId);
//     if (error instanceof Error && error.name === "AbortError") {
//       throw new Error("Request timed out");
//     }
//     // Add a delay before retrying (handled by React Query, but can be enhanced here)
//     await new Promise((resolve) => setTimeout(resolve, 1000)); // 1-second delay
//     throw error instanceof Error ? error : new Error("Unknown fetch error");
//   }
// };

// const fetchMatches = () => fetchData("/api/matches");
// const fetchReplays = () => fetchData("/api/replays");
// const fetchSports = () => fetchData("/api/sports");
// const fetchVideoReels = () => fetchData("/api/video-reels");
// const fetchBanners = () => fetchData("/api/banners");

// interface DataContextType {
//   matchData: Match[] | undefined;
//   replayData: Replay[] | undefined;
//   sportData: Sport[] | undefined;
//   videoReelData: VideoReels[] | undefined;
//   bannerData: Banner[] | undefined;
//   loading: boolean;
//   error: Error | null;
//   refetchData: () => Promise<void>;
//   prefetchData: (endpoint: string) => void;
//   initialLoadComplete: boolean;
// }

// const DataContext = createContext<DataContextType | undefined>(undefined);

// // Updated hooks to accept options
// const useMatches = (options?: any) =>
//   useQuery<Match[]>({
//     queryKey: ["matches"],
//     queryFn: fetchMatches,
//     staleTime: 30 * 1000, // 30 seconds
//     ...options,
//   });

// const useReplays = (options?: any) =>
//   useQuery<Replay[]>({
//     queryKey: ["replays"],
//     queryFn: fetchReplays,
//     staleTime: 60 * 1000, // 1 minute
//     ...options,
//   });

// const useSports = (options?: any) =>
//   useQuery<Sport[]>({
//     queryKey: ["sports"],
//     queryFn: fetchSports,
//     staleTime: 2 * 60 * 60 * 1000, // 2 hours
//     ...options,
//   });

// const useVideoReels = (options?: any) =>
//   useQuery<VideoReels[]>({
//     queryKey: ["videoReels"],
//     queryFn: fetchVideoReels,
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     ...options,
//   });

// const useBanners = (options?: any) =>
//   useQuery<Banner[]>({
//     queryKey: ["banners"],
//     queryFn: fetchBanners,
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     retry: 1,
//     refetchOnWindowFocus: false,
//     refetchInterval: false,
//     ...options,
//   });

// const DataProviderInner: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const queryClient = useQueryClient();

//   // Define query options with retry and delay
//   const queryOptions = {
//     retry: 3, // Retry up to 3 times
//     retryDelay: (attemptIndex: number) =>
//       Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff: 1s, 2s, 4s, max 10s
//     staleTime: 5 * 60 * 1000, // 5 minutes
//   };

//   const {
//     data: matchData = [],
//     isLoading: matchLoading,
//     error: matchError,
//   } = useMatches(queryOptions);
//   const {
//     data: replayData = [],
//     isLoading: replayLoading,
//     error: replayError,
//   } = useReplays({ ...queryOptions, staleTime: 60 * 1000 }); // 1 minute
//   const {
//     data: sportData = [],
//     isLoading: sportLoading,
//     error: sportError,
//   } = useSports({ ...queryOptions, staleTime: 2 * 60 * 60 * 1000 }); // 2 hours
//   const {
//     data: videoReelData = [],
//     isLoading: videoReelLoading,
//     error: videoReelError,
//   } = useVideoReels(queryOptions);
//   const {
//     data: bannerData = [],
//     isLoading: bannerLoading,
//     error: bannerError,
//   } = useBanners({
//     ...queryOptions,
//     retry: 1,
//     refetchOnWindowFocus: false,
//     refetchInterval: false,
//   });

//   const [ws, setWs] = useState<WebSocket | null>(null);
//   const [initialLoadComplete, setIsInitialLoadComplete] = useState(
//     isInitialLoadComplete()
//   );

//   const loading =
//     matchLoading ||
//     replayLoading ||
//     sportLoading ||
//     videoReelLoading ||
//     bannerLoading;
//   const error =
//     matchError || replayError || sportError || videoReelError || bannerError;

//   // Stagger initial data fetching
//   useEffect(() => {
//     const fetchSequentially = async () => {
//       if (!loading && !error && !initialLoadComplete) {
//         setInitialLoadComplete(true); // Persist to localStorage
//         setIsInitialLoadComplete(true); // Update React state
//       }
//     };
//     fetchSequentially();
//   }, [loading, error, initialLoadComplete]);

//   // WebSocket setup remains unchanged
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
//       queryKey: ["matches", "replays", "sports", "videoReels", "banners"],
//     });
//   };

//   const prefetchData = (endpoint: string) => {
//     const endpointMap: Record<string, () => Promise<any>> = {
//       "/api/matches": fetchMatches,
//       "/api/replays": fetchReplays,
//       "/api/sports": fetchSports,
//       "/api/video-reels": fetchVideoReels,
//       "/api/banners": fetchBanners,
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
//         videoReelData,
//         bannerData,
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

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Match } from "@/types/match.types";
import { Replay } from "@/types/replay.types";
import { Sport } from "@/types/sport.types";
import { VideoReels } from "@/types/videoReel.type";
import { Banner } from "@/types/banner.types";
import { setInitialLoadComplete, isInitialLoadComplete } from "@/lib/helper";

const production = "http://51.79.181.110:8080";
const development = "http://localhost:8080";
const API_BASE_URL =
  import.meta.env.VITE_NODE_ENV === "production" ? production : development;

const fetchData = async (url: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    const cachedEtag = localStorage.getItem(`etag:${url}`) || "";
    const res = await fetch(`${API_BASE_URL}${url}`, {
      signal: controller.signal,
      credentials: "include",
      headers: { "If-None-Match": cachedEtag },
    });
    clearTimeout(timeoutId);
    if (res.status === 304) {
      const cachedData = localStorage.getItem(`cache:${url}`);
      return cachedData ? JSON.parse(cachedData) : [];
    }
    if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
    const data = await res.json();
    const etag = res.headers.get("ETag");
    if (etag) {
      localStorage.setItem(`etag:${url}`, etag);
      localStorage.setItem(`cache:${url}`, JSON.stringify(data));
    }
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timed out");
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
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

const queryOptions = {
  retry: 2,
  retryDelay: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 5000),
  cacheTime: 15 * 60 * 1000,
  refetchOnWindowFocus: false,
  refetchInterval: false as const, // Use 'as const' to satisfy ESLint/SonarQube
};

const useMatches = () =>
  useQuery<Match[], Error>({
    queryKey: ["matches"],
    queryFn: fetchMatches,
    staleTime: 10 * 60 * 1000,
    ...queryOptions,
  });

const useReplays = () =>
  useQuery<Replay[], Error>({
    queryKey: ["replays"],
    queryFn: fetchReplays,
    staleTime: 10 * 60 * 1000,
    ...queryOptions,
  });

const useSports = () =>
  useQuery<Sport[], Error>({
    queryKey: ["sports"],
    queryFn: fetchSports,
    staleTime: 4 * 60 * 60 * 1000,
    ...queryOptions,
  });

const useVideoReels = () =>
  useQuery<VideoReels[], Error>({
    queryKey: ["videoReels"],
    queryFn: fetchVideoReels,
    staleTime: 10 * 60 * 1000,
    ...queryOptions,
  });

const useBanners = () =>
  useQuery<Banner[], Error>({
    queryKey: ["banners"],
    queryFn: fetchBanners,
    staleTime: 10 * 60 * 1000,
    ...queryOptions, // Remove redundant 'retry: 1'
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

  const refetchData = useCallback(async () => {
    await Promise.all([
      queryClient.refetchQueries({
        queryKey: ["matches"],
        exact: true,
        type: "active",
      }),
      queryClient.refetchQueries({
        queryKey: ["replays"],
        exact: true,
        type: "active",
      }),
      queryClient.refetchQueries({
        queryKey: ["sports"],
        exact: true,
        type: "active",
      }),
      queryClient.refetchQueries({
        queryKey: ["videoReels"],
        exact: true,
        type: "active",
      }),
      queryClient.refetchQueries({
        queryKey: ["banners"],
        exact: true,
        type: "active",
      }),
    ]);
  }, [queryClient]);

  useEffect(() => {
    if (!loading && !error && !initialLoadComplete) {
      setIsInitialLoadComplete(true);
      setInitialLoadComplete(true);
    }
  }, [loading, error, initialLoadComplete]);

  useEffect(() => {
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const wsUrl =
      import.meta.env.VITE_NODE_ENV === "production"
        ? "wss://sv.hoiquan.live/ws"
        : "ws://localhost:8080/ws";

    const connectWebSocket = () => {
      if (reconnectAttempts >= maxReconnectAttempts) {
        console.error("Max WebSocket reconnect attempts reached");
        return;
      }
      const websocket = new WebSocket(wsUrl);
      websocket.onopen = () => {
        console.log(
          "WebSocket connected at",
          new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
        );
        reconnectAttempts = 0;
      };
      websocket.onmessage = (event: MessageEvent) => {
        const message = JSON.parse(event.data);
        console.log("Received WebSocket message:", message);
        if (message.type === "data_updated") {
          queryClient.invalidateQueries({
            queryKey: [message.endpoint.slice(1)],
            type: "active",
          });
        }
      };
      websocket.onclose = (event: CloseEvent) => {
        console.log(
          "WebSocket disconnected, code:",
          event.code,
          "reason:",
          event.reason
        );
        reconnectAttempts++;
        setTimeout(connectWebSocket, 5000 * reconnectAttempts);
      };
      websocket.onerror = () => {
        websocket.close();
      };
      setWs(websocket);
    };

    connectWebSocket();
    return () => {
      ws?.close();
      setWs(null);
    };
  }, [queryClient]);

  const prefetchData = useCallback(
    (endpoint: string) => {
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
          queryFn: queryFn,
        });
      } else {
        console.warn(`No prefetch function for endpoint: ${endpoint}`);
      }
    },
    [queryClient]
  );

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
