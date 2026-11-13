import { QueryClient, dehydrate } from "@tanstack/react-query";
import type { Route } from "./+types/framework-app";
import App from "./App";
import {
  DEFAULT_PAGE_METADATA,
  cleanPageDescription,
  STATIC_PAGE_METADATA,
  getProgrammeMetadata,
  getResourceMetadata,
  getSouvenirMetadata,
} from "./lib/pageMetadata";


const SITE_URL = "https://kpxacademy.com.ng";
const DEFAULT_API_BASE =
  "https://keplex-registration-backend.onrender.com/api";

const staticMetadata = STATIC_PAGE_METADATA;

const apiBase = () =>
  (import.meta.env.VITE_API_URL || DEFAULT_API_BASE).replace(/[/]+$/, "");

// Prerender runs many route loaders concurrently. Reuse in-flight/successful
// responses and cap backend concurrency to avoid exhausting API rate limits.
const publicDataCache = new Map<string, Promise<unknown>>();
const MAX_CONCURRENT_PUBLIC_REQUESTS = 2;
let activePublicRequests = 0;
const publicRequestQueue: Array<() => void> = [];

async function acquirePublicRequestSlot() {
  if (activePublicRequests >= MAX_CONCURRENT_PUBLIC_REQUESTS) {
    await new Promise<void>((resolve) => publicRequestQueue.push(resolve));
  }
  activePublicRequests += 1;
}

function releasePublicRequestSlot() {
  activePublicRequests -= 1;
  publicRequestQueue.shift()?.();
}

const wait = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function requestPublicData(path: string): Promise<unknown> {
  await acquirePublicRequestSlot();

  try {
    let response: Response | undefined;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      response = await fetch(`${apiBase()}${path}`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(60000),
      });

      if (response.status !== 429 || attempt === 4) break;

      const retryAfter = response.headers.get("Retry-After");
      const retryAfterSeconds = retryAfter ? Number(retryAfter) : NaN;
      const retryAt = retryAfter && Number.isNaN(retryAfterSeconds)
        ? Date.parse(retryAfter) - Date.now()
        : retryAfterSeconds * 1000;
      const backoff = Number.isFinite(retryAt) && retryAt > 0
        ? retryAt
        : 1000 * 2 ** attempt;

      await wait(Math.min(backoff, 15000));
    }

    if (!response?.ok) {
      throw new Error(
        `Public prerender request GET ${path} failed with HTTP ${response?.status ?? "no response"}`,
      );
    }

    const payload = await response.json();
    if (payload?.success !== true || !("data" in payload)) {
      throw new Error(`Public prerender request GET ${path} returned an invalid API envelope`);
    }

    return payload.data;
  } finally {
    releasePublicRequestSlot();
  }
}

async function fetchPublicData<T>(path: string): Promise<T> {
  const cacheKey = `${apiBase()}${path}`;
  let request = publicDataCache.get(cacheKey);

  if (!request) {
    request = requestPublicData(path);
    publicDataCache.set(cacheKey, request);
  }

  try {
    return (await request) as T;
  } catch (error) {
    publicDataCache.delete(cacheKey);
    throw error;
  }
}

async function loadFrameworkRouteData(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 5 * 60 * 1000 } },
  });
  let detailMetadata: { title: string; description: string; canonicalPath: string } | undefined;

  const load = async <T,>(key: readonly unknown[], path: string) => {
    const data = await fetchPublicData<T>(path);
    queryClient.setQueryData(key, data);
    return data;
  };

  const isPublicContentPath =
    pathname === "/" ||
    pathname === "/about" ||
    pathname === "/programs" ||
    pathname === "/certificates" ||
    pathname === "/resources" ||
    pathname === "/gallery" ||
    pathname === "/faq" ||
    pathname === "/souvenirs" ||
    pathname.startsWith("/programs/") ||
    pathname.startsWith("/resources/") ||
    pathname.startsWith("/souvenirs/");

  if (isPublicContentPath) {
    await Promise.all([
      load(["site-content", "branding"], "/site-content/branding"),
      load(["site-content", "organization"], "/site-content/organization"),
    ]);
  }

  if (pathname === "/") {
    await Promise.all([
      load(["site-content", "hero", "slides"], "/site-content/hero/slides"),
      load(["training", "list"], "/training"),
      load(["site-content", "gallery", "categories"], "/site-content/gallery/categories"),
    ]);
  }

  if (pathname === "/about") {
    await load(["founder-profile"], "/site-content/founder");
  }

  if (pathname === "/programs" || pathname === "/certificates") {
    await load(["training", "list"], "/training");
  }

  if (pathname.startsWith("/programs/")) {
    const slug = decodeURIComponent(pathname.slice("/programs/".length));
    const programme = await load<{
      id: string;
      title?: string;
      shortDescription?: string | null;
      description?: string | null;
    }>(
      ["training", "detail", slug],
      `/training/slug/${encodeURIComponent(slug)}`,
    );
    if (programme.title) {
      detailMetadata = getProgrammeMetadata(
        programme.title,
        programme.shortDescription || programme.description,
        slug,
      );
    }
    if (programme.id) {
      await load(
        ["training", "media", programme.id],
        `/training/${encodeURIComponent(programme.id)}/media`,
      );
    }
  }

  if (pathname === "/resources") {
    await load(["site-content", "resources", ""], "/site-content/resources");
  }

  if (pathname.startsWith("/resources/")) {
    const slug = decodeURIComponent(pathname.slice("/resources/".length));
    const resource = await load<{
      title?: string;
      description?: string | null;
    }>(
      ["site-content", "resource", slug],
      `/site-content/resources/${encodeURIComponent(slug)}`,
    );
    if (resource.title) {
      detailMetadata = getResourceMetadata(resource.title, resource.description, slug);
    }
  }

  if (pathname === "/gallery") {
    const category = url.searchParams.get("category") ?? "";
    await Promise.all([
      load(["site-content", "gallery", "categories"], "/site-content/gallery/categories"),
      load(
        ["site-content", "gallery", category],
        category
          ? `/site-content/gallery?category=${encodeURIComponent(category)}`
          : "/site-content/gallery",
      ),
    ]);
  }

  if (pathname === "/faq") {
    await load(["site-content", "faq", "public"], "/site-content/faq");
  }

  if (pathname === "/souvenirs") {
    await load(["souvenirs", "catalogue"], "/souvenirs");
  }

  if (pathname.startsWith("/souvenirs/") && pathname !== "/souvenirs/enquire") {
    const slug = decodeURIComponent(pathname.slice("/souvenirs/".length));
    const product = await load<{
      name?: string;
      description?: string | null;
    }>(
      ["souvenirs", "product", slug],
      `/souvenirs/${encodeURIComponent(slug)}`,
    );
    if (product.name) {
      detailMetadata = getSouvenirMetadata(product.name, product.description, slug);
    }
  }

  const staticPage = staticMetadata[pathname];
  const seo = {
    title: detailMetadata?.title || staticPage?.title || DEFAULT_PAGE_METADATA.title,
    description:
      detailMetadata?.description ||
      staticPage?.description ||
      DEFAULT_PAGE_METADATA.description,
    canonical: new URL(detailMetadata?.canonicalPath || pathname, SITE_URL).toString(),
  };

  return { dehydratedState: dehydrate(queryClient), seo };
}

/**
 * In SPA + prerender mode, only generated public paths have build-time loader
 * data. Every other URL is served through Vercel's SPA fallback, where there is
 * no runtime server loader. Use the same data pipeline in the browser so
 * client-only routes (admin, workshop booking, guest access, etc.) can hydrate
 * and refresh without requesting a nonexistent server data response.
 */
export function loader({ request }: Route.LoaderArgs) {
  return loadFrameworkRouteData(request);
}

export function clientLoader({ request }: Route.ClientLoaderArgs) {
  return loadFrameworkRouteData(request);
}

export function meta({ data, location }: Route.MetaArgs) {
  const pathname = location.pathname;
  const isPrivatePath =
    pathname.startsWith("/admin") ||
    pathname === "/register" ||
    pathname.startsWith("/payment/") ||
    pathname.startsWith("/workshops/access/") ||
    pathname === "/workshops/track-booking" ||
    pathname.includes("/access/");
  const isUnreviewedFormPath =
    pathname === "/workshops/book" || pathname === "/souvenirs/enquire";

  if (isPrivatePath || isUnreviewedFormPath) {
    const fallback = staticMetadata[pathname];
    return [
      ...(fallback ? [{ title: fallback.title }, { name: "description", content: fallback.description }] : []),
      { name: "robots", content: isPrivatePath ? "noindex, nofollow" : "noindex, follow" },
      {
        tagName: "link",
        rel: "canonical",
        href: new URL(pathname, SITE_URL).toString(),
      },
    ];
  }

  const seo = (data as {
    seo?: { title: string; description: string; canonical: string };
  } | undefined)?.seo;
  const fallback = staticMetadata[pathname];
  const title =
    seo?.title ||
    fallback?.title ||
    (pathname.startsWith("/programs/")
      ? "Training Programme Details | KPX Academy"
      : pathname.startsWith("/resources/")
        ? "Training Resource | KPX Academy"
        : DEFAULT_PAGE_METADATA.title);
  const description = cleanPageDescription(
    seo?.description || fallback?.description || DEFAULT_PAGE_METADATA.description,
  );
  const canonical =
    pathname === "/courses"
      ? new URL("/programs", SITE_URL).toString()
      : seo?.canonical || new URL(pathname, SITE_URL).toString();

  return [
    { title },
    { name: "description", content: description },
    { name: "robots", content: "index, follow" },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "KPX Academy" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: canonical },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { tagName: "link", rel: "canonical", href: canonical },
  ];
}

export default function AppRoute({ loaderData }: Route.ComponentProps) {
  return <App dehydratedState={loaderData.dehydratedState} />;
}
