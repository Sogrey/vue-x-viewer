import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import fixShaderMacro from "./vite-plugin-fix-shader";

export default defineConfig({
  base: "/",
  plugins: [vue(), vueDevTools(), fixShaderMacro()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      worker_threads: fileURLToPath(new URL("./src/utils/empty-worker.ts", import.meta.url)),
      fs: fileURLToPath(new URL("./src/utils/empty-worker.ts", import.meta.url)),
      module: fileURLToPath(new URL("./src/utils/empty-worker.ts", import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ["worker_threads", "fs", "module"],
    include: ["@x-viewer/core"],
  },
  build: {
    chunkSizeWarningLimit: 10000,
  },
});
