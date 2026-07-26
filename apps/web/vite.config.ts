import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.svg",
        "PWA-ICON-LIGHT-192.png",
        "PWA-ICON-LIGHT-512.png",
      ],
      manifest: {
        name: "theDevJournal",
        short_name: "DevJournal",
        description:
          "A place for developers to jot down their ideas, notes, and code snippets.",
        theme_color: "#09090b",
        background_color: "#09090b",
        display: "standalone",
        orientation: "any",
        scope: "/",
        start_url: "/",
        categories: ["productivity", "developer tools", "utilities"],
        icons: [
          {
            src: "favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "maskable",
          },
          {
            src: "PWA-ICON-LIGHT-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "PWA-ICON-LIGHT-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "PWA-ICON-LIGHT-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
});
