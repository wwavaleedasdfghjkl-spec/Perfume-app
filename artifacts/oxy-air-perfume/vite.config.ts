import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

// تحديد موقع مجلد الصور المرفقة تلقائياً
const getAssetsPath = () => {
  if (fs.existsSync(path.resolve(__dirname, "./attached_assets"))) {
    return path.resolve(__dirname, "./attached_assets");
  }
  if (fs.existsSync(path.resolve(__dirname, "../attached_assets"))) {
    return path.resolve(__dirname, "../attached_assets");
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
