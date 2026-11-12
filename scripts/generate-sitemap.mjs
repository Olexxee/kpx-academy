import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createSitemapXml, getPublicRouteManifest } from "./public-routes.mjs";

const paths = await getPublicRouteManifest();
const xml = createSitemapXml(paths);

await writeFile(resolve("public/sitemap.xml"), xml, "utf8");
console.info(`[sitemap] Generated ${paths.length} public URLs.`);
