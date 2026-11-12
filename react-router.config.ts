import type { Config } from "@react-router/dev/config";
import { getPublicRouteManifest } from "./scripts/public-routes.mjs";

export default {
  appDirectory: "src",
  ssr: false,
  async prerender() {
    const paths = await getPublicRouteManifest();
    console.info(`[prerender] Discovered ${paths.length} public routes.`);
    return paths;
  },
} satisfies Config;
