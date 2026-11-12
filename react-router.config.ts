import type { Config } from "@react-router/dev/config";

export default {
  appDirectory: "src",
  ssr: false,
  // Prerender paths will be enabled after public route data is safe to load
  // during the build.
} satisfies Config;
