import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

const SITE_URL = "https://kpxacademy.com.ng";
const DEFAULT_TITLE = "KPX Academy | Practical Skills Training & Creative Learning";
const DEFAULT_DESCRIPTION =
  "Learn practical, skill-based techniques with KPX Academy. Explore detailed training, creative workshops, beauty and product formulation, and resources.";

const pageMetadata: Record<string, { title: string; description: string }> = {
  "/": {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
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
  "/workshops/book": {
    title: "Book a Creative Workshop | KPX Academy",
    description: "Request a practical creative workshop with KPX Academy for your group, organisation, or event.",
  },
};

const noIndexPrefixes = [
  "/admin",
  "/payment/",
  "/workshops/access/",
];

function resolveMetadata(pathname: string) {
  if (pathname === "/courses") {
    return { ...pageMetadata["/programs"], canonicalPath: "/programs" };
  }

  const exact = pageMetadata[pathname];
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
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
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
    const metadata = resolveMetadata(pathname);
    const canonicalUrl = new URL(metadata.canonicalPath, SITE_URL).toString();
    const noIndex = noIndexPrefixes.some((prefix) => pathname.startsWith(prefix)) || /\\/access\\//.test(pathname);

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

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname, location.search]);

  return (
    <div className="flex min-h-screen flex-col bg-neutral">
      <RouteMetadata pathname={location.pathname} />
      <SiteHeader />
      <main id="main-content" className="min-w-0 flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
};
