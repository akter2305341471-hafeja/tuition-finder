import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Development: /api requests are forwarded to the Django server.
// Build: output goes to backend/frontend_dist so Django can serve the whole site.
export default defineConfig({
  plugins: [react()],
  build: { outDir: "../backend/frontend_dist", emptyOutDir: true },
  server: { port: 5173, proxy: { "/api": "http://localhost:8000" } },
});
