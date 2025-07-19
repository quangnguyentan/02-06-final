import * as React from "react";
import { lazy, Suspense } from "react";
import { RouteObject } from "react-router-dom";
import PublicPageWrapper from "./wrapper";
import { useParams } from "react-router-dom";
import { useData } from "@/context/DataContext";

// Lazy-loaded components
const HomePage = lazy(() => import("../Home/index"));
const SportProviderPage = lazy(() => import("../SportProvider/index"));
const LivePage = lazy(() => import("../Live/index"));
const SchedulePageIndex = lazy(() => import("../Schedule/index"));
const ResultPage = lazy(() => import("../Result/index"));
const ReplayPage = lazy(() => import("../Replay/index"));
const XoiLacTVPage = lazy(() => import("../XoiLacTV/index"));
const ReplayStreamPage = lazy(() => import("../ReplayStream/index"));
const VideoReelPage = lazy(() => import("../VideoReelStream/index"));

import { Loader } from "@/components/layout/Loader";
// Wrapper component to decide between ReplayPage and ReplayStreamPage
const ReplayRouteHandler: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { sportData } = useData(); // Assuming sportData is available in DataContext

  // Check if the slug matches a sport category
  const isSportSlug = sportData?.some((sport) => sport.slug === slug);

  return (
    <Suspense fallback={<Loader />}>
      {isSportSlug ? <ReplayPage /> : <ReplayStreamPage />}
    </Suspense>
  );
};

const publicRoutes: (RouteObject & { role?: string[] })[] = [
  {
    path: "/",
    element: <PublicPageWrapper />,
    children: [
      {
        path: "",
        element: (
          <Suspense fallback={<Loader />}>
            <HomePage />
          </Suspense>
        ),
        index: true,
      },
      {
        path: "/:slug",
        element: (
          <Suspense fallback={<Loader />}>
            <SportProviderPage />
          </Suspense>
        ),
      },
      {
        path: "/truc-tiep/:slug/:slugSport",
        element: (
          <Suspense fallback={<Loader />}>
            <LivePage />
          </Suspense>
        ),
      },
      {
        path: "/lich-thi-dau/:slug",
        element: (
          <Suspense fallback={<Loader />}>
            <SchedulePageIndex />
          </Suspense>
        ),
      },

      {
        path: "/ket-qua/:slug",
        element: (
          <Suspense fallback={<Loader />}>
            <ResultPage />
          </Suspense>
        ),
      },
      {
        path: "/xem-lai/:slug",
        element: <ReplayRouteHandler />,
      },
      {
        path: "/video-reel/:title/:sportSlug",
        element: <VideoReelPage />,
      },
      {
        path: "/xoi-lac-tv",
        element: (
          <Suspense fallback={<Loader />}>
            <XoiLacTVPage />
          </Suspense>
        ),
      },
    ],
    // role: ["USER"],
  },
];

export default publicRoutes;
