# SEO prerendering implementation plan

## Decision

Adopt the official React Router Vite framework integration for static prerendering. Keep the existing Vite, React, React Router, and Vercel deployment rather than migrating the application to Next.js or introducing a browser-crawling prerender plugin.

The current application uses declarative React Router mode (`createBrowserRouter`) and React Query hooks for public catalogue data. Those hooks currently fetch after the browser renders. A crawler-based snapshot could therefore capture loading placeholders, and client-side metadata updates are not a substitute for HTML generated at build time.

## Scope

Prerender only public, indexable routes:

- Static: `/`, `/about`, `/programs`, `/certificates`, `/resources`, `/gallery`, `/faq`, `/souvenirs`
- Dynamic: active programme details, published resource readers, active non-archived souvenir product details.

Keep these out of prerendering:

- `/admin/**`
- `/register`
- `/payment/**`
- `/workshops/access/**`
- `/souvenirs/**/access/**`
- private order/enquiry access pages and tokenized URLs.

Review `/workshops/book` and `/souvenirs/enquire` separately before including them in the indexable route set. Their presence in the current sitemap does not automatically make them suitable prerender targets.

## Implementation status on `seo/prerendering-framework-adoption`

Implemented in the current branch:

- React Router framework route module and Vite integration; runtime SSR remains disabled.
- A shared public-route manifest now drives both sitemap generation and React Router prerender path discovery.
- The manifest includes the eight approved static public routes plus active programme, published resource, and active non-archived souvenir detail paths.
- Build-time route loaders prefetch public data into the existing React Query keys for the shared header/footer and each public page. The application hydrates that cache before the public components render.
- Route-specific title, description, canonical, Open Graph, Twitter, and robots metadata are emitted by the framework route module. Private/admin/payment/tokenized paths receive noindex metadata and are not included in the prerender manifest.
- Vercel's SPA rewrite now targets React Router's `__spa-fallback.html`, while filesystem precedence preserves generated route HTML.

The implementation is not considered complete until a clean production build confirms route HTML output and generated files are inspected for real headings/content, metadata, and absence of loading placeholders. The backend API must be reachable during the build. The manifest uses `VITE_API_URL` when provided and otherwise falls back to the public Render API base URL.

## Implementation sequence

1. Convert the existing `createBrowserRouter` route tree to React Router framework route modules. Preserve all current paths and route behavior, including admin protection and aliases.
2. Add the React Router Vite plugin and matching runtime adapter versions. Keep the Vite version on the existing Vite 8 line. Confirm the deployment Node runtime meets the framework's Node 22.22+ requirement.
3. Introduce server-safe public data functions for programmes, resources, souvenirs, and other public homepage sections. Avoid browser-only storage, `window`, and authenticated API behavior during build-time rendering.
4. Add build-time loaders for public listing and detail routes. Dynamic paths must come from the same public API records used by the sitemap. Fail the prerender build when a route's required public content cannot be loaded; do not silently generate an indexable empty page.
5. Render public page metadata and structured data into the generated HTML. Keep client hydration and existing React Query interactions working after load.
6. Configure static prerendering (`ssr: false`) for the explicit public route list. Do not enable a permanent runtime SSR server unless a later requirement justifies it.
7. Add build validation that checks generated HTML for real page headings/content, route-specific title, description, canonical URL, robots directives, and absence of loading skeletons.
8. Add a secure content-change rebuild mechanism after the static generation flow is proven. Admin changes to programmes, resources, or souvenirs must trigger a new deployment/build; use a protected deployment hook or another authenticated mechanism, not a public unauthenticated endpoint.

## Audit findings and risks

### Confirmed framework prerequisites

- React Router's official framework adoption guide requires Node.js 22.22.0+ and Vite 7+ or Vite 8+. The repository already uses Vite 8, but its CI workflow previously selected the moving `22` Node line without documenting the minimum patch.
- The branch now declares `engines.node >=22.22.0`, pins `.nvmrc` to `22.22.0`, and tests CI on Node 22.22.0. This makes the runtime requirement explicit before introducing the framework plugin.
- The migration must follow the official RouterProvider adoption sequence: convert route definitions to route modules, move providers into the framework root, replace `createRoot` with `HydratedRouter`, and only then enable prerendering. The plugin cannot be mounted around the existing `RouterProvider`.

### Data hydration strategy

- The shared public shell uses React Query for the site logo and organization profile. The homepage additionally uses training catalogue data and gallery categories. The certificates page uses the training catalogue. Public detail/list pages use programme, resource, and souvenir queries.
- The public pages can retain their existing React Query hooks if route loaders prefetch the same query keys and the root route wraps the outlet in a React Query `HydrationBoundary` using the loader's dehydrated cache. This avoids a risky wholesale rewrite of existing page components while still rendering API-backed content into build-time HTML.
- Build-time prefetch must use an unauthenticated, server-safe API client with an explicit `VITE_API_URL`; it must not reuse browser cookie state or call `/auth/me`. Admin routes and tokenized access routes must never be part of the prerender path list.
- The homepage currently loads data through multiple independent components. The loader cache must include `["training", "list"]`, `["site-content", "gallery", "categories"]`, `["site-content", "branding"]`, and `["site-content", "organization"]` so those components render meaningful content without waiting for browser requests.
- Programme detail pages additionally use `["training", "detail", slug]` and `["training", "media", programId]`; resources use the existing public resource query keys; souvenirs use `["souvenirs", "catalogue"]` and `["souvenirs", "product", slug]`. Exact query keys must be checked against the current hooks before implementation.
- The shared auth bootstrap currently invokes `useCurrentUser` globally. It must be made client-only or excluded from the static root loader; a build-time request must never be made to an authenticated current-user endpoint.
- The public footer/header React Query calls should use the same hydrated cache, rather than issuing duplicate requests during initial hydration.


- `src/router.tsx` currently creates a browser router and `src/main.tsx` uses `createRoot`; framework mode requires a framework root and hydrated client entry.
- Public listing/detail pages use React Query hooks, so data must be moved into build-time route loaders or safely hydrated from loader data.
- The homepage featured-programme component uses `Math.random()` during render. This is nondeterministic and must be replaced with a stable selection before static generation to avoid build instability and hydration mismatches.
- The homepage and shared shell contain additional React Query consumers (featured programmes, gallery preview, authentication bootstrap). Each must be audited for build-time safety and public/private data boundaries.
- Programme cards fetch media independently. Build-time rendering should avoid an N+1 request pattern; prefer media included in the public catalogue response or a bounded batch strategy.
- Resource readers embed a PDF URL in an iframe. The HTML should contain the resource title and description even though the PDF itself is a separate asset.
- Souvenir product pages contain an order form and mutation flow. Static generation may render the public product description and catalogue data, but order creation and payment must remain browser-only.
- Existing sitemap generation and prerender path generation must share one authoritative public-route manifest to prevent sitemap/HTML drift.
- The current API base URL is configured through frontend environment variables; the build must fail clearly if the required public API base URL is missing for dynamic route generation.

## Acceptance criteria

- Direct HTTP requests to every indexable static and dynamic URL return pre-rendered HTML with meaningful route content.
- Each generated page has a unique, accurate title, meta description, canonical URL, robots directive, Open Graph metadata, and appropriate structured data.
- Unknown, inactive, unpublished, archived, and private records are not emitted as indexable HTML.
- Admin, registration, payment, guest-access, and tokenized routes are not prerendered.
- The client hydrates without console errors or content mismatch warnings.
- The generated sitemap contains exactly the eligible public routes.
- Build output reports generated route count and fails if required public data cannot be retrieved.
- Vercel deployment serves the correct route-specific HTML on a direct request, not only after client-side navigation.
