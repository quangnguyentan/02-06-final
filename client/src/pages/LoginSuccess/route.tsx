import { lazy, Suspense } from "react";
import { RouteObject } from "react-router-dom";
const LoginSuccessPage = lazy(() => import("./index"));
const loginSuccessRoutes: (RouteObject & { role?: string[] })[] = [
  {
    path: "/login-success/:userId/:tokenLogin",
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
        <LoginSuccessPage />
      </Suspense>
    ),
  },
];
export default loginSuccessRoutes;
