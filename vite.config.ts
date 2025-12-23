import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Feature flags: set via env vars at build time, defaults to true (all enabled in dev)
const featureFlags = {
  __ENABLE_DASHBOARD__: JSON.stringify(process.env.ENABLE_DASHBOARD !== "false"),
};

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  define: featureFlags,
});
