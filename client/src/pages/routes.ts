import { RouteObject } from "react-router-dom";

const routeFiles = import.meta.glob<{ default: RouteObject[] }>(
  "./**/route.tsx",
  {
    eager: true,
  }
);
const routes = Object.values(routeFiles)
  .flatMap((module) => module.default)
  .filter((route) => route.path);
export default routes;
