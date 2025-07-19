import { Loader } from "@/components/layout/Loader";
import { Suspense, lazy } from "react";

const HomePage = lazy(() => import("./index"));

export default function HomePageWrapper() {
  return (
    <Suspense fallback={<Loader />}>
      <HomePage />
    </Suspense>
  );
}
