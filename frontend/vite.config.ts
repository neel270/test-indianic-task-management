import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";
import eslint from "vite-plugin-eslint";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), eslint({
      failOnError: false, // show errors in overlay instead of stopping build
      failOnWarning: false,
      emitWarning: true,
      emitError: true
    })].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
