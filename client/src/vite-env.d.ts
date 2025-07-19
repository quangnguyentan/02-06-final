/// <reference types="vite/client" />
declare module "*.tsx" {
  import type { ReactElement } from "react";
  const component: () => ReactElement;
  export default component;
}
