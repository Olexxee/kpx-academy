import type { ReactNode } from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import "./styles/design-system.css";
import "./index.css";

const organizationJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "KPX Academy",
  url: "https://kpxacademy.com.ng/",
  description: "Practical Knowledge. Detailed Training. Real Value.",
  slogan: "Practical Skills. More Possibilities.",
});

export function meta() {
  return [];
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#17324D" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <Meta />
        <Links />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: organizationJsonLd }}
        />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return <Outlet />;
}
