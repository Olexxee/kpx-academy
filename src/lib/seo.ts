export interface PageMetadataInput {
  title: string;
  description: string;
  canonicalPath: string;
  robots?: string;
}

import { cleanPageDescription } from "./pageMetadata";

const SITE_URL = "https://kpxacademy.com.ng";

const setMeta = (
  key: string,
  content: string,
  attribute: "name" | "property" = "name",
) => {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`,
  );
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
};

export const updatePageMetadata = ({
  title,
  description,
  canonicalPath,
  robots = "index, follow",
}: PageMetadataInput) => {
  const safeDescription = cleanPageDescription(description);
  const canonicalUrl = new URL(canonicalPath, SITE_URL).toString();

  document.title = title;
  setMeta("description", safeDescription);
  setMeta("robots", robots);
  setMeta("og:type", "website", "property");
  setMeta("og:site_name", "KPX Academy", "property");
  setMeta("og:title", title, "property");
  setMeta("og:description", safeDescription, "property");
  setMeta("og:url", canonicalUrl, "property");
  setMeta("twitter:card", "summary");
  setMeta("twitter:title", title);
  setMeta("twitter:description", safeDescription);

  let canonical = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = canonicalUrl;
};
