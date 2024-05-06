import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    https: true,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
    // hmr: {
    //   clientPort: 443,
    // },
  },
});
