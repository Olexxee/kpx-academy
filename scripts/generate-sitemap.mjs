import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const siteUrl = "https://kpxacademy.com.ng";
const apiBase = process.env.VITE_API_URL?.replace(/\/+$/, "");

const staticPaths = [
  "/",
  "/about",
  "/programs",
  "/certificates",
  "/resources",
  "/gallery",
  "/faq",
  "/souvenirs",
  "/workshops/book",
];

if (!apiBase) {
  console.warn("[sitemap] VITE_API_URL is not set; keeping the checked-in sitemap.");
  process.exit(0);
}

const fetchPublicData = async (path) => {
  const response = await fetch(`${apiBase}${path}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`GET ${path} returned HTTP ${response.status}`);
  }

  const payload = await response.json();
  if (payload?.success !== true || !Array.isArray(payload.data)) {
    throw new Error(`GET ${path} returned an unexpected response shape`);
  }

  return payload.data;
};

try {
  const [programmes, resources, souvenirs] = await Promise.all([
    fetchPublicData("/training"),
    fetchPublicData("/site-content/resources"),
    fetchPublicData("/souvenirs"),
  ]);

  const dynamicPaths = [
    ...programmes
      .filter((item) => item.active && item.slug)
      .map((item) => `/programs/${encodeURIComponent(item.slug)}`),
    ...resources
      .filter((item) => item.status === "PUBLISHED" && item.slug)
      .map((item) => `/resources/${encodeURIComponent(item.slug)}`),
    ...souvenirs
      .filter((item) => item.active && !item.archivedAt && item.slug)
      .map((item) => `/souvenirs/${encodeURIComponent(item.slug)}`),
  ];

  const paths = [...new Set([...staticPaths, ...dynamicPaths])];
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...paths.map((path) => `  <url><loc>${siteUrl}${path}</loc></url>`),
    "</urlset>",
    "",
  ].join("\n");

  await writeFile(resolve("public/sitemap.xml"), xml, "utf8");
  console.info(`[sitemap] Generated ${paths.length} public URLs.`);
} catch (error) {
  console.warn(
    "[sitemap] Public API data could not be loaded; keeping the checked-in sitemap.",
    error instanceof Error ? error.message : error,
  );
}
