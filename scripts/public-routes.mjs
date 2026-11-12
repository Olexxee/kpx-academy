const SITE_URL = "https://kpxacademy.com.ng";
const DEFAULT_API_BASE =
  "https://keplex-registration-backend.onrender.com/api";

export const STATIC_PUBLIC_PATHS = [
  "/",
  "/about",
  "/programs",
  "/certificates",
  "/resources",
  "/gallery",
  "/faq",
  "/souvenirs",
];

const getApiBase = (override) =>
  (override || process.env.VITE_API_URL || DEFAULT_API_BASE).replace(/[/]+$/, "");

const fetchPublicCollection = async (apiBase, path) => {
  const response = await fetch(\`\${apiBase}\${path}\`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    throw new Error(\`GET \${path} returned HTTP \${response.status}\`);
  }

  const payload = await response.json();
  if (payload?.success !== true || !Array.isArray(payload.data)) {
    throw new Error(\`GET \${path} returned an unexpected response shape\`);
  }

  return payload.data;
};

export const getPublicRouteManifest = async (apiBaseOverride) => {
  const apiBase = getApiBase(apiBaseOverride);
  const [programmes, resources, souvenirs] = await Promise.all([
    fetchPublicCollection(apiBase, "/training"),
    fetchPublicCollection(apiBase, "/site-content/resources"),
    fetchPublicCollection(apiBase, "/souvenirs"),
  ]);

  const dynamicPaths = [
    ...programmes
      .filter((item) => item.active === true && typeof item.slug === "string" && item.slug)
      .map((item) => \`/programs/\${encodeURIComponent(item.slug)}\`),
    ...resources
      .filter((item) => item.status === "PUBLISHED" && typeof item.slug === "string" && item.slug)
      .map((item) => \`/resources/\${encodeURIComponent(item.slug)}\`),
    ...souvenirs
      .filter((item) => item.active === true && !item.archivedAt && typeof item.slug === "string" && item.slug)
      .map((item) => \`/souvenirs/\${encodeURIComponent(item.slug)}\`),
  ];

  return [...new Set([...STATIC_PUBLIC_PATHS, ...dynamicPaths])];
};

export const createSitemapXml = (paths) => {
  const escapeXml = (value) =>
    value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...paths.map((path) => \`  <url><loc>\${escapeXml(new URL(path, SITE_URL).toString())}</loc></url>\`),
    "</urlset>",
    "",
  ].join("\n");
};
