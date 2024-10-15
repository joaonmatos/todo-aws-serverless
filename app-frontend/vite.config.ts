import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import serveStatic from "vite-plugin-serve-static";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

const staticServe = serveStatic([
  {
    pattern: /^\/config\.json/,
    resolve: __dirname + "/config.local.json",
  },
]);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [TanStackRouterVite(), react(), staticServe],
  server: {
    port: 6543,
  },
});
