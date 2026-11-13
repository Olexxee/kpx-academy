export interface PageMetadata {
  title: string;
  description: string;
}

const SITE_NAME = "KPX Academy";

export const DEFAULT_PAGE_METADATA: PageMetadata = {
  title: "KPX Academy | Practical Skills & Creative Training",
  description:
    "Build practical skills with KPX Academy through detailed training, creative workshops, product formulation, and hands-on learning.",
};

export const STATIC_PAGE_METADATA: Record<string, PageMetadata> = {
  "/": DEFAULT_PAGE_METADATA,
  "/about": {
    title: "About KPX Academy | Our Story & Training Approach",
    description:
      "Learn about KPX Academy's practical approach to skills training, creative learning, product development, and entrepreneurship.",
  },
  "/programs": {
    title: "Practical Skills Training Courses | KPX Academy",
    description:
      "Explore practical skills training courses at KPX Academy, including creative arts, beauty, product formulation, and entrepreneurship. Compare programmes and find the right training.",
  },
  "/certificates": {
    title: "KPX Academy Certificate Verification",
    description:
      "Verify a KPX Academy certificate or submit proof of work for review by the academy.",
  },
  "/resources": {
    title: "Practical Training Guides & Learning Resources | KPX Academy",
    description:
      "Read and download practical training guides, manuals, and learning resources from KPX Academy.",
  },
  "/gallery": {
    title: "Student Projects & Creative Training Gallery | KPX Academy",
    description:
      "View student projects, creative work, and practical training activities from KPX Academy.",
  },
  "/faq": {
    title: "KPX Academy FAQs | Courses, Registration & Payments",
    description:
      "Find answers about KPX Academy training courses, registration, payments, workshops, certificates, and learning.",
  },
  "/souvenirs": {
    title: "Custom Souvenirs & Personalised Gifts | KPX Academy",
    description:
      "Explore custom souvenirs and personalised gifts from KPX Academy. Enquire about product options, colours, and bulk orders.",
  },
  "/workshops/track-booking": {
    title: "Track a Workshop Booking | KPX Academy",
    description:
      "Securely check the status and updates for your KPX Academy creative workshop booking.",
  },
  "/workshops/book": {
    title: "Book a Creative Workshop | KPX Academy",
    description:
      "Request a practical creative workshop with KPX Academy for your group, organisation, or event.",
  },
  "/register": {
    title: "Register for Training | KPX Academy",
    description:
      "Choose a KPX Academy training programme and continue to secure registration and payment.",
  },
  "/souvenirs/enquire": {
    title: "Request a Custom Souvenir | KPX Academy",
    description:
      "Tell KPX Academy about your custom souvenir idea, quantity, and event requirements.",
  },
};

export function getProgrammeMetadata(
  title: string,
  description: string | null | undefined,
  slug: string,
): PageMetadata & { canonicalPath: string } {
  const includesTraining = /\btraining\b/i.test(title);
  return {
    title: includesTraining
      ? `${title} | ${SITE_NAME}`
      : `${title} | Practical Training | ${SITE_NAME}`,
    description:
      description ||
      `Explore ${title}, a practical training programme from KPX Academy. View the course details, learning information, and registration options.`,
    canonicalPath: `/programs/${encodeURIComponent(slug)}`,
  };
}

export function getResourceMetadata(
  title: string,
  description: string | null | undefined,
  slug: string,
): PageMetadata & { canonicalPath: string } {
  return {
    title: `${title} | ${SITE_NAME} Learning Resource`,
    description:
      description ||
      `Read or download ${title}, a practical learning resource from KPX Academy.`,
    canonicalPath: `/resources/${encodeURIComponent(slug)}`,
  };
}

export function getSouvenirMetadata(
  name: string,
  description: string | null | undefined,
  slug: string,
): PageMetadata & { canonicalPath: string } {
  return {
    title: `${name} | Custom Souvenir Package | ${SITE_NAME}`,
    description:
      description ||
      `Explore the ${name} souvenir package from KPX Academy and enquire about quantities, colours, and custom requirements.`,
    canonicalPath: `/souvenirs/${encodeURIComponent(slug)}`,
  };
}

export function cleanPageDescription(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}
