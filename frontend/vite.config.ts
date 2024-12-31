import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": "http://127.0.0.1:8000", // reach out to the dev server
    },
  },
  resolve: {
    alias: {
      crypto: "empty-module",
    },
  },
  define: {
    global: "globalThis",
  },
});
