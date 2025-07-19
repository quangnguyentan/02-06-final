import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import * as path from "path";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    extensions: [".js", ".ts", ".jsx", ".tsx"],
  },
  server: {
    port: 5173,
    allowedHosts: ["hoiquan.live"], // Thêm host được phép
    proxy: {
      "/api": {
        target: "https://sv.hoiquan.live",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    outDir: "dist", // Thư mục output khi build
    sourcemap: process.env.NODE_ENV !== "production", // Chỉ tạo sourcemap trong development
  },
});
