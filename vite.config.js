import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages에 배포할 경우 base를 "/저장소이름/" 으로 변경하세요.
// Vercel/Netlify는 "/" 그대로 두면 됩니다.
export default defineConfig({
  plugins: [react()],
  base: "/mind-ledger/",
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          charts: ["recharts"],
        },
      },
    },
  },
});
