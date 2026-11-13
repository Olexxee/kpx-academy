import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { DEFAULT_PAGE_METADATA, STATIC_PAGE_METADATA } from "../../lib/pageMetadata";

const SITE_URL = "https://kpxacademy.com.ng";

const noIndexPrefixes = [
  "/admin",
  "/register",
  "/payment/",
  "/workshops/access/",
  "/workshops/track-booking",
  "/workshops/book",
  "/souvenirs/enquire",
];

function resolveMetadata(pathname: string) {
  if (pathname === "/courses") {
    return { ...STATIC_PAGE_METADATA["/programs"], canonicalPath: "/programs" };
  }

  const exact = STATIC_PAGE_METADATA[pathname];
  if (exact) return { ...exact, canonicalPath: pathname };

  if (pathname.startsWith("/programs/")) {
    return {
      title: "Training Programme Details | KPX Academy",
      description: "Explore programme details, learning outcomes, and registration information for this KPX Academy training programme.",
      canonicalPath: pathname,
    };
  }

  if (pathname.startsWith("/resources/")) {
    return {
      title: "Training Resource | KPX Academy",
      description: "Read this practical learning resource from KPX Academy.",
      canonicalPath: pathname,
    };
  }

  return {
    title: DEFAULT_PAGE_METADATA.title,
    description: DEFAULT_PAGE_METADATA.description,
    canonicalPath: pathname,
  };
}

function updateMeta(name: string, content: string, attribute: "name" | "property" = "name") {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.content = content;
}

function RouteMetadata({ pathname }: { pathname: string }) {
  useEffect(() => {
    const ownsContentMetadata =
      pathname.startsWith("/programs/") ||
      pathname.startsWith("/resources/") ||
      (pathname.startsWith("/souvenirs/") && pathname !== "/souvenirs/enquire");

    // Detail pages apply metadata after their public API record is available.
    // Tokenized access pages are excluded from this early return so noindex remains authoritative.
    if (ownsContentMetadata && !pathname.includes("/access/")) return;

    const metadata = resolveMetadata(pathname);
    const canonicalUrl = new URL(metadata.canonicalPath, SITE_URL).toString();
    const noIndex = noIndexPrefixes.some((prefix) => pathname.startsWith(prefix)) || pathname.includes("/access/");

    document.title = metadata.title;
    updateMeta("description", metadata.description);
    updateMeta("robots", noIndex ? "noindex, nofollow" : "index, follow");
    updateMeta("og:type", "website", "property");
    updateMeta("og:site_name", "KPX Academy", "property");
    updateMeta("og:title", metadata.title, "property");
    updateMeta("og:description", metadata.description, "property");
    updateMeta("og:url", canonicalUrl, "property");
    updateMeta("twitter:card", "summary");
    updateMeta("twitter:title", metadata.title);
    updateMeta("twitter:description", metadata.description);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }, [pathname]);

  return null;
}

export const Layout = () => {
  const location = useLocation();
  const mainContentRef = useRef<HTMLElement>(null);
  const previousPathnameRef = useRef(location.pathname);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (previousPathnameRef.current === location.pathname) return;
    previousPathnameRef.current = location.pathname;
    mainContentRef.current?.focus({ preventScroll: true });
  }, [location.pathname]);

  return (
    <div className="public-site-shell flex min-h-screen flex-col bg-neutral">
      <RouteMetadata pathname={location.pathname} />
      <a href="#main-content" className="sr-only z-[100] rounded-control bg-white px-4 py-3 font-semibold text-primary focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary">
        Skip to main content
      </a>
      <SiteHeader />
      <main ref={mainContentRef} id="main-content" tabIndex={-1} className="min-w-0 flex-1 focus:outline-none">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
};
