import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

// البحث عن مجلد الصور المرفقة في المجلد الحالي أو جذر المشروع الرئيسي
const getAssetsPath = () => {
  const candidatePaths = [
    path.resolve(__dirname, "./attached_assets"),
    path.resolve(__dirname, "../attached_assets"),
    path.resolve(__dirname, "../../attached_assets"),
    path.resolve(__dirname, "./src/assets"),
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return path.resolve(__dirname, "./src/assets");
};

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@assets": getAssetsPath(),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
