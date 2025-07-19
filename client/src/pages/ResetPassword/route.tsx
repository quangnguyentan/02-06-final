import { lazy, Suspense } from "react";
import { RouteObject } from "react-router-dom";
const ResetPasswordPage = lazy(() => import("./index"));
const resetPasswordRoutes: (RouteObject & { role?: string[] })[] = [
  {
    path: "/reset-password/:resetToken",
    element: (
      <Suspense
        fallback={
          <div id="load">
            <div>G</div>
            <div>N</div>
            <div>I</div>
            <div>D</div>
            <div>A</div>
            <div>O</div>
            <div>L</div>
          </div>
        }
      >
        <ResetPasswordPage />
      </Suspense>
    ),
  },
];
export default resetPasswordRoutes;
