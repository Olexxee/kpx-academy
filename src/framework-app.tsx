import { QueryClient, dehydrate } from "@tanstack/react-query";
import type { Route } from "./+types/framework-app";
import App from "./App";

const DEFAULT_API_BASE =
  "https://keplex-registration-backend.onrender.com/api";

const apiBase = () =>
  (process.env.VITE_API_URL || DEFAULT_API_BASE).replace(/[/]+$/, "");

async function fetchPublicData<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBase()}${path}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    throw new Error(`Public prerender request GET ${path} failed with HTTP ${response.status}`);
  }

  const payload = await response.json();
  if (payload?.success !== true || !("data" in payload)) {
    throw new Error(`Public prerender request GET ${path} returned an invalid API envelope`);
  }

  return payload.data as T;
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 5 * 60 * 1000 } },
  });

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
    const programme = await load<{ id: string }>(
      ["training", "detail", slug],
      `/training/slug/${encodeURIComponent(slug)}`,
    );
    if (programme?.id) {
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
    await load(
      ["site-content", "resource", slug],
      `/site-content/resources/${encodeURIComponent(slug)}`,
    );
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
    await load(
      ["souvenirs", "product", slug],
      `/souvenirs/${encodeURIComponent(slug)}`,
    );
  }

  return { dehydratedState: dehydrate(queryClient) };
}

export default function AppRoute({ loaderData }: Route.ComponentProps) {
  return <App dehydratedState={loaderData.dehydratedState} />;
}
