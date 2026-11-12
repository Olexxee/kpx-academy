import { QueryClient, dehydrate } from "@tanstack/react-query";
import type { Route } from "./+types/framework-app";
import App from "./App";

const SITE_URL = "https://kpxacademy.com.ng";
const DEFAULT_API_BASE =
  "https://keplex-registration-backend.onrender.com/api";

const staticMetadata: Record<string, { title: string; description: string }> = {
  "/": {
    title: "KPX Academy | Practical Skills Training & Creative Learning",
    description: "Learn practical, skill-based techniques with KPX Academy. Explore detailed training, creative workshops, beauty and product formulation, and resources.",
  },
  "/about": {
    title: "About KPX Academy | Our Story & Learning Philosophy",
    description: "Discover KPX Academy's commitment to practical knowledge, detailed training, and real value across creative skills, beauty, product development, and entrepreneurship.",
  },
  "/programs": {
    title: "Training Programmes | KPX Academy",
    description: "Explore practical training programmes from KPX Academy. Find skill-focused learning designed to help you practise, create, and grow.",
  },
  "/certificates": {
    title: "Certificate Verification & Proof of Work | KPX Academy",
    description: "Verify a KPX Academy certificate or submit proof of work for review by the academy.",
  },
  "/resources": {
    title: "Learning Resources & Training Guides | KPX Academy",
    description: "Explore KPX Academy training manuals, practical guides, and learning resources. Read online or download materials for offline use.",
  },
  "/gallery": {
    title: "Student Projects & Training Gallery | KPX Academy",
    description: "Explore practical projects, creative work, and training activities from KPX Academy.",
  },
  "/faq": {
    title: "Frequently Asked Questions | KPX Academy",
    description: "Find answers about KPX Academy programmes, registration, payments, workshops, certificates, and learning.",
  },
  "/souvenirs": {
    title: "Custom Souvenirs & Gifts | KPX Academy",
    description: "Explore KPX Academy's custom souvenir catalogue and enquire about personalised products and bulk orders.",
  },
};

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
  let detailTitle: string | undefined;
  let detailDescription: string | undefined;

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
    detailTitle = programme.title;
    detailDescription = programme.shortDescription || programme.description || undefined;
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
    detailTitle = resource.title;
    detailDescription = resource.description || undefined;
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
    detailTitle = product.name;
    detailDescription = product.description || undefined;
  }

  const staticPage = staticMetadata[pathname];
  const seo = {
    title: detailTitle
      ? `${detailTitle} | KPX Academy`
      : staticPage?.title || "KPX Academy | Practical Skills Training & Creative Learning",
    description:
      detailDescription ||
      staticPage?.description ||
      "Explore practical skills training, creative learning, and resources from KPX Academy.",
    canonical: new URL(pathname, SITE_URL).toString(),
  };

  return { dehydratedState: dehydrate(queryClient), seo };
}

export function meta({ data }: Route.MetaArgs) {
  const seo = (data as {
    seo?: { title: string; description: string; canonical: string };
  } | undefined)?.seo;

  if (!seo) return [];

  return [
    { title: seo.title },
    { name: "description", content: seo.description },
    { name: "robots", content: "index, follow" },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "KPX Academy" },
    { property: "og:title", content: seo.title },
    { property: "og:description", content: seo.description },
    { property: "og:url", content: seo.canonical },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: seo.title },
    { name: "twitter:description", content: seo.description },
    { tagName: "link", rel: "canonical", href: seo.canonical },
  ];
}

export default function AppRoute({ loaderData }: Route.ComponentProps) {
  return <App dehydratedState={loaderData.dehydratedState} />;
}
