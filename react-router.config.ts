import type { Config } from "@react-router/dev/config";

export default {
  ssr: false,
  // The public route list will be enabled after route loaders and data
  // dependencies are migrated to build-time-safe implementations.
} satisfies Config;
